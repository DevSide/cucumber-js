'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _time = require('./time');

var _time2 = _interopRequireDefault(_time);

var _uncaught_exception_manager = require('./uncaught_exception_manager');

var _uncaught_exception_manager2 = _interopRequireDefault(_uncaught_exception_manager);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserCodeRunner = function () {
  function UserCodeRunner() {
    (0, _classCallCheck3.default)(this, UserCodeRunner);
  }

  (0, _createClass3.default)(UserCodeRunner, null, [{
    key: 'run',
    value: function () {
      var _ref2 = (0, _bluebird.coroutine)(function* (_ref) {
        var argsArray = _ref.argsArray,
            thisArg = _ref.thisArg,
            fn = _ref.fn,
            timeoutInMilliseconds = _ref.timeoutInMilliseconds;

        var callbackPromise = new _bluebird2.default(function (resolve, reject) {
          argsArray.push(function (error, result) {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });

        var fnReturn = void 0;
        try {
          fnReturn = fn.apply(thisArg, argsArray);
        } catch (e) {
          var _error = e instanceof Error ? e : new Error(_util2.default.format(e));
          return { error: _error };
        }

        var racingPromises = [];
        var callbackInterface = fn.length === argsArray.length;
        var promiseInterface = fnReturn && typeof fnReturn.then === 'function';

        if (callbackInterface && promiseInterface) {
          return {
            error: new Error('function uses multiple asynchronous interfaces: callback and promise\n' + 'to use the callback interface: do not return a promise\n' + 'to use the promise interface: remove the last argument to the function')
          };
        } else if (callbackInterface) {
          racingPromises.push(callbackPromise);
        } else if (promiseInterface) {
          racingPromises.push(fnReturn);
        } else {
          return { result: fnReturn };
        }

        var exceptionHandler = void 0;
        var uncaughtExceptionPromise = new _bluebird2.default(function (resolve, reject) {
          exceptionHandler = reject;
          _uncaught_exception_manager2.default.registerHandler(exceptionHandler);
        });
        racingPromises.push(uncaughtExceptionPromise);

        var timeoutId = void 0;
        if (timeoutInMilliseconds >= 0) {
          var timeoutPromise = new _bluebird2.default(function (resolve, reject) {
            timeoutId = _time2.default.setTimeout(function () {
              var timeoutMessage = 'function timed out after ' + timeoutInMilliseconds + ' milliseconds';
              reject(new Error(timeoutMessage));
            }, timeoutInMilliseconds);
          });
          racingPromises.push(timeoutPromise);
        }

        var error = void 0,
            result = void 0;
        try {
          result = yield _bluebird2.default.race(racingPromises);
        } catch (e) {
          if (e instanceof Error) {
            error = e;
          } else if (e) {
            error = new Error(_util2.default.format(e));
          } else {
            error = new Error('Promise rejected without a reason');
          }
        }

        _time2.default.clearTimeout(timeoutId);
        _uncaught_exception_manager2.default.unregisterHandler(exceptionHandler);

        return { error: error, result: result };
      });

      function run(_x) {
        return _ref2.apply(this, arguments);
      }

      return run;
    }()
  }]);
  return UserCodeRunner;
}();

exports.default = UserCodeRunner;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91c2VyX2NvZGVfcnVubmVyLmpzIl0sIm5hbWVzIjpbIlVzZXJDb2RlUnVubmVyIiwiYXJnc0FycmF5IiwidGhpc0FyZyIsImZuIiwidGltZW91dEluTWlsbGlzZWNvbmRzIiwiY2FsbGJhY2tQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInB1c2giLCJlcnJvciIsInJlc3VsdCIsImZuUmV0dXJuIiwiYXBwbHkiLCJlIiwiRXJyb3IiLCJmb3JtYXQiLCJyYWNpbmdQcm9taXNlcyIsImNhbGxiYWNrSW50ZXJmYWNlIiwibGVuZ3RoIiwicHJvbWlzZUludGVyZmFjZSIsInRoZW4iLCJleGNlcHRpb25IYW5kbGVyIiwidW5jYXVnaHRFeGNlcHRpb25Qcm9taXNlIiwicmVnaXN0ZXJIYW5kbGVyIiwidGltZW91dElkIiwidGltZW91dFByb21pc2UiLCJzZXRUaW1lb3V0IiwidGltZW91dE1lc3NhZ2UiLCJyYWNlIiwiY2xlYXJUaW1lb3V0IiwidW5yZWdpc3RlckhhbmRsZXIiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0lBRXFCQSxjOzs7Ozs7Ozs0REFDaUQ7QUFBQSxZQUFqREMsU0FBaUQsUUFBakRBLFNBQWlEO0FBQUEsWUFBdENDLE9BQXNDLFFBQXRDQSxPQUFzQztBQUFBLFlBQTdCQyxFQUE2QixRQUE3QkEsRUFBNkI7QUFBQSxZQUF6QkMscUJBQXlCLFFBQXpCQSxxQkFBeUI7O0FBQ2xFLFlBQU1DLGtCQUFrQix1QkFBWSxVQUFDQyxPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdkROLG9CQUFVTyxJQUFWLENBQWUsVUFBQ0MsS0FBRCxFQUFRQyxNQUFSLEVBQW1CO0FBQ2hDLGdCQUFJRCxLQUFKLEVBQVc7QUFDVEYscUJBQU9FLEtBQVA7QUFDRCxhQUZELE1BRU87QUFDTEgsc0JBQVFJLE1BQVI7QUFDRDtBQUNGLFdBTkQ7QUFPRCxTQVJ1QixDQUF4Qjs7QUFVQSxZQUFJQyxpQkFBSjtBQUNBLFlBQUk7QUFDRkEscUJBQVdSLEdBQUdTLEtBQUgsQ0FBU1YsT0FBVCxFQUFrQkQsU0FBbEIsQ0FBWDtBQUNELFNBRkQsQ0FFRSxPQUFPWSxDQUFQLEVBQVU7QUFDVixjQUFNSixTQUFRSSxhQUFhQyxLQUFiLEdBQXFCRCxDQUFyQixHQUF5QixJQUFJQyxLQUFKLENBQVUsZUFBS0MsTUFBTCxDQUFZRixDQUFaLENBQVYsQ0FBdkM7QUFDQSxpQkFBTyxFQUFFSixhQUFGLEVBQVA7QUFDRDs7QUFFRCxZQUFNTyxpQkFBaUIsRUFBdkI7QUFDQSxZQUFNQyxvQkFBb0JkLEdBQUdlLE1BQUgsS0FBY2pCLFVBQVVpQixNQUFsRDtBQUNBLFlBQU1DLG1CQUFtQlIsWUFBWSxPQUFPQSxTQUFTUyxJQUFoQixLQUF5QixVQUE5RDs7QUFFQSxZQUFJSCxxQkFBcUJFLGdCQUF6QixFQUEyQztBQUN6QyxpQkFBTztBQUNMVixtQkFBTyxJQUFJSyxLQUFKLENBQ0wsMkVBQ0UsMERBREYsR0FFRSx3RUFIRztBQURGLFdBQVA7QUFPRCxTQVJELE1BUU8sSUFBSUcsaUJBQUosRUFBdUI7QUFDNUJELHlCQUFlUixJQUFmLENBQW9CSCxlQUFwQjtBQUNELFNBRk0sTUFFQSxJQUFJYyxnQkFBSixFQUFzQjtBQUMzQkgseUJBQWVSLElBQWYsQ0FBb0JHLFFBQXBCO0FBQ0QsU0FGTSxNQUVBO0FBQ0wsaUJBQU8sRUFBRUQsUUFBUUMsUUFBVixFQUFQO0FBQ0Q7O0FBRUQsWUFBSVUseUJBQUo7QUFDQSxZQUFNQywyQkFBMkIsdUJBQVksVUFBQ2hCLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNoRWMsNkJBQW1CZCxNQUFuQjtBQUNBLCtDQUF5QmdCLGVBQXpCLENBQXlDRixnQkFBekM7QUFDRCxTQUhnQyxDQUFqQztBQUlBTCx1QkFBZVIsSUFBZixDQUFvQmMsd0JBQXBCOztBQUVBLFlBQUlFLGtCQUFKO0FBQ0EsWUFBSXBCLHlCQUF5QixDQUE3QixFQUFnQztBQUM5QixjQUFNcUIsaUJBQWlCLHVCQUFZLFVBQUNuQixPQUFELEVBQVVDLE1BQVYsRUFBcUI7QUFDdERpQix3QkFBWSxlQUFLRSxVQUFMLENBQWdCLFlBQU07QUFDaEMsa0JBQU1DLCtDQUE2Q3ZCLHFCQUE3QyxrQkFBTjtBQUNBRyxxQkFBTyxJQUFJTyxLQUFKLENBQVVhLGNBQVYsQ0FBUDtBQUNELGFBSFcsRUFHVHZCLHFCQUhTLENBQVo7QUFJRCxXQUxzQixDQUF2QjtBQU1BWSx5QkFBZVIsSUFBZixDQUFvQmlCLGNBQXBCO0FBQ0Q7O0FBRUQsWUFBSWhCLGNBQUo7QUFBQSxZQUFXQyxlQUFYO0FBQ0EsWUFBSTtBQUNGQSxtQkFBUyxNQUFNLG1CQUFRa0IsSUFBUixDQUFhWixjQUFiLENBQWY7QUFDRCxTQUZELENBRUUsT0FBT0gsQ0FBUCxFQUFVO0FBQ1YsY0FBSUEsYUFBYUMsS0FBakIsRUFBd0I7QUFDdEJMLG9CQUFRSSxDQUFSO0FBQ0QsV0FGRCxNQUVPLElBQUlBLENBQUosRUFBTztBQUNaSixvQkFBUSxJQUFJSyxLQUFKLENBQVUsZUFBS0MsTUFBTCxDQUFZRixDQUFaLENBQVYsQ0FBUjtBQUNELFdBRk0sTUFFQTtBQUNMSixvQkFBUSxJQUFJSyxLQUFKLENBQVUsbUNBQVYsQ0FBUjtBQUNEO0FBQ0Y7O0FBRUQsdUJBQUtlLFlBQUwsQ0FBa0JMLFNBQWxCO0FBQ0EsNkNBQXlCTSxpQkFBekIsQ0FBMkNULGdCQUEzQzs7QUFFQSxlQUFPLEVBQUVaLFlBQUYsRUFBU0MsY0FBVCxFQUFQO0FBQ0QsTzs7Ozs7Ozs7Ozs7O2tCQTNFa0JWLGMiLCJmaWxlIjoidXNlcl9jb2RlX3J1bm5lci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJ1xuaW1wb3J0IFRpbWUgZnJvbSAnLi90aW1lJ1xuaW1wb3J0IFVuY2F1Z2h0RXhjZXB0aW9uTWFuYWdlciBmcm9tICcuL3VuY2F1Z2h0X2V4Y2VwdGlvbl9tYW5hZ2VyJ1xuaW1wb3J0IHV0aWwgZnJvbSAndXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVXNlckNvZGVSdW5uZXIge1xuICBzdGF0aWMgYXN5bmMgcnVuKHsgYXJnc0FycmF5LCB0aGlzQXJnLCBmbiwgdGltZW91dEluTWlsbGlzZWNvbmRzIH0pIHtcbiAgICBjb25zdCBjYWxsYmFja1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBhcmdzQXJyYXkucHVzaCgoZXJyb3IsIHJlc3VsdCkgPT4ge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGxldCBmblJldHVyblxuICAgIHRyeSB7XG4gICAgICBmblJldHVybiA9IGZuLmFwcGx5KHRoaXNBcmcsIGFyZ3NBcnJheSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zdCBlcnJvciA9IGUgaW5zdGFuY2VvZiBFcnJvciA/IGUgOiBuZXcgRXJyb3IodXRpbC5mb3JtYXQoZSkpXG4gICAgICByZXR1cm4geyBlcnJvciB9XG4gICAgfVxuXG4gICAgY29uc3QgcmFjaW5nUHJvbWlzZXMgPSBbXVxuICAgIGNvbnN0IGNhbGxiYWNrSW50ZXJmYWNlID0gZm4ubGVuZ3RoID09PSBhcmdzQXJyYXkubGVuZ3RoXG4gICAgY29uc3QgcHJvbWlzZUludGVyZmFjZSA9IGZuUmV0dXJuICYmIHR5cGVvZiBmblJldHVybi50aGVuID09PSAnZnVuY3Rpb24nXG5cbiAgICBpZiAoY2FsbGJhY2tJbnRlcmZhY2UgJiYgcHJvbWlzZUludGVyZmFjZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZXJyb3I6IG5ldyBFcnJvcihcbiAgICAgICAgICAnZnVuY3Rpb24gdXNlcyBtdWx0aXBsZSBhc3luY2hyb25vdXMgaW50ZXJmYWNlczogY2FsbGJhY2sgYW5kIHByb21pc2VcXG4nICtcbiAgICAgICAgICAgICd0byB1c2UgdGhlIGNhbGxiYWNrIGludGVyZmFjZTogZG8gbm90IHJldHVybiBhIHByb21pc2VcXG4nICtcbiAgICAgICAgICAgICd0byB1c2UgdGhlIHByb21pc2UgaW50ZXJmYWNlOiByZW1vdmUgdGhlIGxhc3QgYXJndW1lbnQgdG8gdGhlIGZ1bmN0aW9uJ1xuICAgICAgICApLFxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2FsbGJhY2tJbnRlcmZhY2UpIHtcbiAgICAgIHJhY2luZ1Byb21pc2VzLnB1c2goY2FsbGJhY2tQcm9taXNlKVxuICAgIH0gZWxzZSBpZiAocHJvbWlzZUludGVyZmFjZSkge1xuICAgICAgcmFjaW5nUHJvbWlzZXMucHVzaChmblJldHVybilcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHsgcmVzdWx0OiBmblJldHVybiB9XG4gICAgfVxuXG4gICAgbGV0IGV4Y2VwdGlvbkhhbmRsZXJcbiAgICBjb25zdCB1bmNhdWdodEV4Y2VwdGlvblByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBleGNlcHRpb25IYW5kbGVyID0gcmVqZWN0XG4gICAgICBVbmNhdWdodEV4Y2VwdGlvbk1hbmFnZXIucmVnaXN0ZXJIYW5kbGVyKGV4Y2VwdGlvbkhhbmRsZXIpXG4gICAgfSlcbiAgICByYWNpbmdQcm9taXNlcy5wdXNoKHVuY2F1Z2h0RXhjZXB0aW9uUHJvbWlzZSlcblxuICAgIGxldCB0aW1lb3V0SWRcbiAgICBpZiAodGltZW91dEluTWlsbGlzZWNvbmRzID49IDApIHtcbiAgICAgIGNvbnN0IHRpbWVvdXRQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICB0aW1lb3V0SWQgPSBUaW1lLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRpbWVvdXRNZXNzYWdlID0gYGZ1bmN0aW9uIHRpbWVkIG91dCBhZnRlciAke3RpbWVvdXRJbk1pbGxpc2Vjb25kc30gbWlsbGlzZWNvbmRzYFxuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IodGltZW91dE1lc3NhZ2UpKVxuICAgICAgICB9LCB0aW1lb3V0SW5NaWxsaXNlY29uZHMpXG4gICAgICB9KVxuICAgICAgcmFjaW5nUHJvbWlzZXMucHVzaCh0aW1lb3V0UHJvbWlzZSlcbiAgICB9XG5cbiAgICBsZXQgZXJyb3IsIHJlc3VsdFxuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSBhd2FpdCBQcm9taXNlLnJhY2UocmFjaW5nUHJvbWlzZXMpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBlcnJvciA9IGVcbiAgICAgIH0gZWxzZSBpZiAoZSkge1xuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcih1dGlsLmZvcm1hdChlKSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVycm9yID0gbmV3IEVycm9yKCdQcm9taXNlIHJlamVjdGVkIHdpdGhvdXQgYSByZWFzb24nKVxuICAgICAgfVxuICAgIH1cblxuICAgIFRpbWUuY2xlYXJUaW1lb3V0KHRpbWVvdXRJZClcbiAgICBVbmNhdWdodEV4Y2VwdGlvbk1hbmFnZXIudW5yZWdpc3RlckhhbmRsZXIoZXhjZXB0aW9uSGFuZGxlcilcblxuICAgIHJldHVybiB7IGVycm9yLCByZXN1bHQgfVxuICB9XG59XG4iXX0=