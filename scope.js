'use strict';

function Scope() {
    this.watchers = [];
    this.lastDirtyWatch = null;
    this.asyncQueue = [];
    this.postDigestQueue = [];
    this.phase = null;
    this.phases = {
        getDigestPhase: "digest",
        getApplyPhase: "apply"
    };
}

function initWatchValue() {
}

Scope.prototype.watch = function (watchFn, listenerFn, valueEq) {
    var watcher,
        that = this;

    watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn || function () {
        },
        valueEq: !!valueEq,
        prev: initWatchValue
    };
    this.watchers.push(watcher);
    this.lastDirtyWatch = null;

    return function () {
        _.remove(that.watchers, function (w) {
            return _.isEqual(w, watcher);
        });
    };
};

Scope.prototype.watchGroup = function (watchFns, listenerFn) {
    var that = this,
        prevValues = watchFns,
        currValues = watchFns;

    _.forEach(watchFns, function (wFn) {
        that.watch(wFn, function (currValue, prevValue) {
            currValues.push(currValue);
            prevValue.push(prevValue);
            listenerFn(prevValues, currValue, that);
        });
    });
};

Scope.prototype.digestOnce = function () {
    var that = this,
        prevValue,
        currValue,
        dirty = false;
    _.forEach(this.watchers, function (watcher) {
        try {
            currValue = watcher.watchFn(that);
            prevValue = watcher.prev;
            if (!that.areEqual(currValue, prevValue, watcher.valueEq)) {
                that.lastDirtyWatch = watcher;
                watcher.prev = (watcher.valueEq ? _.cloneDeep(currValue) : currValue);
                watcher.listenerFn(currValue,
                    (prevValue === initWatchValue ? currValue : prevValue),
                    that);
                dirty = true;
            } else if (that.lastDirtyWatch === watcher) {
                return false;
            }
        } catch (e) {
            console.error(e);
        }
    });
    return dirty;
};


Scope.prototype.digest = function () {
    var ttl = 10,
        asyncExpr;
    this.lastDirtyWatch = null;
    this.startPhase(this.phases.getDigestPhase);
    while (this.digestOnce() || this.asyncQueue.length) {
        while (this.asyncQueue.length) {
            try {
                asyncExpr = this.asyncQueue.shift();
                asyncExpr.scope.eval(asyncExpr.expr);
            } catch (e) {
                console.error(e);
            }
        }
        if ((this.digestOnce() || this.asyncQueue.length) && (!ttl--)) {
            this.clearPhase();
            throw "10 iterations reached";
        }
    }
    this.clearPhase();

    while (this.postDigestQueue.length) {
        try {
            this.postDigestQueue.shift()();
        } catch (e) {
            console.error(e);
        }
    }
};

Scope.prototype.areEqual = function (currValue, prevValue, valueEq) {
    if (valueEq) {
        return _.isEqual(currValue, prevValue);
    } else {
        return (currValue === prevValue);
    }
};

Scope.prototype.eval = function (expr) {
    return expr(this);
};

Scope.prototype.apply = function (expr) {
    try {
        this.startPhase(this.phases.getApplyPhase);
        return this.eval(expr);
    } finally {
        this.clearPhase();
        this.digest();
    }
};

Scope.prototype.evalAsync = function (expr) {
    var that = this;
    if (!that.phase && !that.asyncQueue.length) {
        setTimeout(function () {
            if (that.asyncQueue.length) {
                that.digest();
            }
        }, 0);
    }
    this.asyncQueue.push({scope: this,expr: expr});
};

Scope.prototype.startPhase = function (phase) {
    if (this.phase !== null) {
        throw this.phase + " in process";
    }
    this.phase = phase;
};

Scope.prototype.clearPhase = function () {
    this.phase = null;
};

Scope.prototype.postDigest = function (fn) {
    this.postDigestQueue.push(fn);
};