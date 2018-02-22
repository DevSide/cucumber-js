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

var _helpers = require('../../formatter/helpers');

var _command_types = require('./command_types');

var _command_types2 = _interopRequireDefault(_command_types);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _readline = require('readline');

var _readline2 = _interopRequireDefault(_readline);

var _stack_trace_filter = require('../stack_trace_filter');

var _stack_trace_filter2 = _interopRequireDefault(_stack_trace_filter);

var _support_code_library_builder = require('../../support_code_library_builder');

var _support_code_library_builder2 = _interopRequireDefault(_support_code_library_builder);

var _test_case_runner = require('../test_case_runner');

var _test_case_runner2 = _interopRequireDefault(_test_case_runner);

var _user_code_runner = require('../../user_code_runner');

var _user_code_runner2 = _interopRequireDefault(_user_code_runner);

var _verror = require('verror');

var _verror2 = _interopRequireDefault(_verror);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EVENTS = ['test-case-prepared', 'test-case-started', 'test-step-started', 'test-step-attachment', 'test-step-finished', 'test-case-finished'];

var Slave = function () {
  function Slave(_ref) {
    var _this = this;

    var cwd = _ref.cwd,
        stdin = _ref.stdin,
        stdout = _ref.stdout;
    (0, _classCallCheck3.default)(this, Slave);

    this.initialized = false;
    this.stdin = stdin;
    this.stdout = stdout;
    this.cwd = cwd;
    this.eventBroadcaster = new _events2.default();
    this.stackTraceFilter = new _stack_trace_filter2.default();
    EVENTS.forEach(function (name) {
      _this.eventBroadcaster.on(name, function (data) {
        return _this.stdout.write(JSON.stringify({ command: _command_types2.default.EVENT, name: name, data: data }) + '\n');
      });
    });
  }

  (0, _createClass3.default)(Slave, [{
    key: 'initialize',
    value: function () {
      var _ref3 = (0, _bluebird.coroutine)(function* (_ref2) {
        var filterStacktraces = _ref2.filterStacktraces,
            supportCodeRequiredModules = _ref2.supportCodeRequiredModules,
            supportCodePaths = _ref2.supportCodePaths,
            worldParameters = _ref2.worldParameters;

        supportCodeRequiredModules.map(function (module) {
          return require(module);
        });
        _support_code_library_builder2.default.reset(this.cwd);
        supportCodePaths.forEach(function (codePath) {
          return require(codePath);
        });
        this.supportCodeLibrary = _support_code_library_builder2.default.finalize();
        this.worldParameters = worldParameters;
        this.filterStacktraces = filterStacktraces;
        if (this.filterStacktraces) {
          this.stackTraceFilter.filter();
        }
        yield this.runTestRunHooks('beforeTestRunHookDefinitions', 'a BeforeAll');
        this.stdout.write(JSON.stringify({ command: _command_types2.default.READY }) + '\n');
      });

      function initialize(_x) {
        return _ref3.apply(this, arguments);
      }

      return initialize;
    }()
  }, {
    key: 'finalize',
    value: function () {
      var _ref4 = (0, _bluebird.coroutine)(function* () {
        yield this.runTestRunHooks('afterTestRunHookDefinitions', 'an AfterAll');
        if (this.filterStacktraces) {
          this.stackTraceFilter.unfilter();
        }
        process.exit();
      });

      function finalize() {
        return _ref4.apply(this, arguments);
      }

      return finalize;
    }()
  }, {
    key: 'parseMasterLine',
    value: function parseMasterLine(line) {
      var input = JSON.parse(line);
      if (input.command === 'initialize') {
        this.initialize(input);
      } else if (input.command === 'finalize') {
        this.finalize();
      } else if (input.command === 'run') {
        this.runTestCase(input);
      }
    }
  }, {
    key: 'run',
    value: function () {
      var _ref5 = (0, _bluebird.coroutine)(function* () {
        var _this2 = this;

        this.rl = _readline2.default.createInterface({ input: this.stdin });
        this.rl.on('line', function (line) {
          _this2.parseMasterLine(line);
        });
      });

      function run() {
        return _ref5.apply(this, arguments);
      }

      return run;
    }()
  }, {
    key: 'runTestCase',
    value: function () {
      var _ref7 = (0, _bluebird.coroutine)(function* (_ref6) {
        var testCase = _ref6.testCase,
            skip = _ref6.skip;

        var testCaseRunner = new _test_case_runner2.default({
          eventBroadcaster: this.eventBroadcaster,
          skip: skip,
          supportCodeLibrary: this.supportCodeLibrary,
          testCase: testCase,
          worldParameters: this.worldParameters
        });
        yield testCaseRunner.run();
        this.stdout.write(JSON.stringify({ command: _command_types2.default.READY }) + '\n');
      });

      function runTestCase(_x2) {
        return _ref7.apply(this, arguments);
      }

      return runTestCase;
    }()
  }, {
    key: 'runTestRunHooks',
    value: function () {
      var _ref8 = (0, _bluebird.coroutine)(function* (key, name) {
        var _this3 = this;

        yield _bluebird2.default.each(this.supportCodeLibrary[key], function () {
          var _ref9 = (0, _bluebird.coroutine)(function* (hookDefinition) {
            var _ref10 = yield _user_code_runner2.default.run({
              argsArray: [],
              fn: hookDefinition.code,
              thisArg: null,
              timeoutInMilliseconds: hookDefinition.options.timeout || _this3.supportCodeLibrary.defaultTimeout
            }),
                error = _ref10.error;

            if (error) {
              var location = (0, _helpers.formatLocation)(hookDefinition);
              throw new _verror2.default(error, name + ' hook errored, process exiting: ' + location);
            }
          });

          return function (_x5) {
            return _ref9.apply(this, arguments);
          };
        }());
      });

      function runTestRunHooks(_x3, _x4) {
        return _ref8.apply(this, arguments);
      }

      return runTestRunHooks;
    }()
  }]);
  return Slave;
}();

exports.default = Slave;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ydW50aW1lL3BhcmFsbGVsL3NsYXZlLmpzIl0sIm5hbWVzIjpbIkVWRU5UUyIsIlNsYXZlIiwiY3dkIiwic3RkaW4iLCJzdGRvdXQiLCJpbml0aWFsaXplZCIsImV2ZW50QnJvYWRjYXN0ZXIiLCJzdGFja1RyYWNlRmlsdGVyIiwiZm9yRWFjaCIsIm9uIiwibmFtZSIsIndyaXRlIiwiSlNPTiIsInN0cmluZ2lmeSIsImNvbW1hbmQiLCJFVkVOVCIsImRhdGEiLCJmaWx0ZXJTdGFja3RyYWNlcyIsInN1cHBvcnRDb2RlUmVxdWlyZWRNb2R1bGVzIiwic3VwcG9ydENvZGVQYXRocyIsIndvcmxkUGFyYW1ldGVycyIsIm1hcCIsInJlcXVpcmUiLCJtb2R1bGUiLCJyZXNldCIsImNvZGVQYXRoIiwic3VwcG9ydENvZGVMaWJyYXJ5IiwiZmluYWxpemUiLCJmaWx0ZXIiLCJydW5UZXN0UnVuSG9va3MiLCJSRUFEWSIsInVuZmlsdGVyIiwicHJvY2VzcyIsImV4aXQiLCJsaW5lIiwiaW5wdXQiLCJwYXJzZSIsImluaXRpYWxpemUiLCJydW5UZXN0Q2FzZSIsInJsIiwiY3JlYXRlSW50ZXJmYWNlIiwicGFyc2VNYXN0ZXJMaW5lIiwidGVzdENhc2UiLCJza2lwIiwidGVzdENhc2VSdW5uZXIiLCJydW4iLCJrZXkiLCJlYWNoIiwiaG9va0RlZmluaXRpb24iLCJhcmdzQXJyYXkiLCJmbiIsImNvZGUiLCJ0aGlzQXJnIiwidGltZW91dEluTWlsbGlzZWNvbmRzIiwib3B0aW9ucyIsInRpbWVvdXQiLCJkZWZhdWx0VGltZW91dCIsImVycm9yIiwibG9jYXRpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLFNBQVMsQ0FDYixvQkFEYSxFQUViLG1CQUZhLEVBR2IsbUJBSGEsRUFJYixz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LEsiLCJmaWxlIjoic2xhdmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmb3JtYXRMb2NhdGlvbiB9IGZyb20gJy4uLy4uL2Zvcm1hdHRlci9oZWxwZXJzJ1xuaW1wb3J0IGNvbW1hbmRUeXBlcyBmcm9tICcuL2NvbW1hbmRfdHlwZXMnXG5pbXBvcnQgRXZlbnRFbWl0dGVyIGZyb20gJ2V2ZW50cydcbmltcG9ydCBQcm9taXNlIGZyb20gJ2JsdWViaXJkJ1xuaW1wb3J0IHJlYWRsaW5lIGZyb20gJ3JlYWRsaW5lJ1xuaW1wb3J0IFN0YWNrVHJhY2VGaWx0ZXIgZnJvbSAnLi4vc3RhY2tfdHJhY2VfZmlsdGVyJ1xuaW1wb3J0IHN1cHBvcnRDb2RlTGlicmFyeUJ1aWxkZXIgZnJvbSAnLi4vLi4vc3VwcG9ydF9jb2RlX2xpYnJhcnlfYnVpbGRlcidcbmltcG9ydCBUZXN0Q2FzZVJ1bm5lciBmcm9tICcuLi90ZXN0X2Nhc2VfcnVubmVyJ1xuaW1wb3J0IFVzZXJDb2RlUnVubmVyIGZyb20gJy4uLy4uL3VzZXJfY29kZV9ydW5uZXInXG5pbXBvcnQgVkVycm9yIGZyb20gJ3ZlcnJvcidcblxuY29uc3QgRVZFTlRTID0gW1xuICAndGVzdC1jYXNlLXByZXBhcmVkJyxcbiAgJ3Rlc3QtY2FzZS1zdGFydGVkJyxcbiAgJ3Rlc3Qtc3RlcC1zdGFydGVkJyxcbiAgJ3Rlc3Qtc3RlcC1hdHRhY2htZW50JyxcbiAgJ3Rlc3Qtc3RlcC1maW5pc2hlZCcsXG4gICd0ZXN0LWNhc2UtZmluaXNoZWQnLFxuXVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTbGF2ZSB7XG4gIGNvbnN0cnVjdG9yKHsgY3dkLCBzdGRpbiwgc3Rkb3V0IH0pIHtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2VcbiAgICB0aGlzLnN0ZGluID0gc3RkaW5cbiAgICB0aGlzLnN0ZG91dCA9IHN0ZG91dFxuICAgIHRoaXMuY3dkID0gY3dkXG4gICAgdGhpcy5ldmVudEJyb2FkY2FzdGVyID0gbmV3IEV2ZW50RW1pdHRlcigpXG4gICAgdGhpcy5zdGFja1RyYWNlRmlsdGVyID0gbmV3IFN0YWNrVHJhY2VGaWx0ZXIoKVxuICAgIEVWRU5UUy5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgdGhpcy5ldmVudEJyb2FkY2FzdGVyLm9uKG5hbWUsIGRhdGEgPT5cbiAgICAgICAgdGhpcy5zdGRvdXQud3JpdGUoXG4gICAgICAgICAgSlNPTi5zdHJpbmdpZnkoeyBjb21tYW5kOiBjb21tYW5kVHlwZXMuRVZFTlQsIG5hbWUsIGRhdGEgfSkgKyAnXFxuJ1xuICAgICAgICApXG4gICAgICApXG4gICAgfSlcbiAgfVxuXG4gIGFzeW5jIGluaXRpYWxpemUoe1xuICAgIGZpbHRlclN0YWNrdHJhY2VzLFxuICAgIHN1cHBvcnRDb2RlUmVxdWlyZWRNb2R1bGVzLFxuICAgIHN1cHBvcnRDb2RlUGF0aHMsXG4gICAgd29ybGRQYXJhbWV0ZXJzLFxuICB9KSB7XG4gICAgc3VwcG9ydENvZGVSZXF1aXJlZE1vZHVsZXMubWFwKG1vZHVsZSA9PiByZXF1aXJlKG1vZHVsZSkpXG4gICAgc3VwcG9ydENvZGVMaWJyYXJ5QnVpbGRlci5yZXNldCh0aGlzLmN3ZClcbiAgICBzdXBwb3J0Q29kZVBhdGhzLmZvckVhY2goY29kZVBhdGggPT4gcmVxdWlyZShjb2RlUGF0aCkpXG4gICAgdGhpcy5zdXBwb3J0Q29kZUxpYnJhcnkgPSBzdXBwb3J0Q29kZUxpYnJhcnlCdWlsZGVyLmZpbmFsaXplKClcbiAgICB0aGlzLndvcmxkUGFyYW1ldGVycyA9IHdvcmxkUGFyYW1ldGVyc1xuICAgIHRoaXMuZmlsdGVyU3RhY2t0cmFjZXMgPSBmaWx0ZXJTdGFja3RyYWNlc1xuICAgIGlmICh0aGlzLmZpbHRlclN0YWNrdHJhY2VzKSB7XG4gICAgICB0aGlzLnN0YWNrVHJhY2VGaWx0ZXIuZmlsdGVyKClcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5ydW5UZXN0UnVuSG9va3MoJ2JlZm9yZVRlc3RSdW5Ib29rRGVmaW5pdGlvbnMnLCAnYSBCZWZvcmVBbGwnKVxuICAgIHRoaXMuc3Rkb3V0LndyaXRlKEpTT04uc3RyaW5naWZ5KHsgY29tbWFuZDogY29tbWFuZFR5cGVzLlJFQURZIH0pICsgJ1xcbicpXG4gIH1cblxuICBhc3luYyBmaW5hbGl6ZSgpIHtcbiAgICBhd2FpdCB0aGlzLnJ1blRlc3RSdW5Ib29rcygnYWZ0ZXJUZXN0UnVuSG9va0RlZmluaXRpb25zJywgJ2FuIEFmdGVyQWxsJylcbiAgICBpZiAodGhpcy5maWx0ZXJTdGFja3RyYWNlcykge1xuICAgICAgdGhpcy5zdGFja1RyYWNlRmlsdGVyLnVuZmlsdGVyKClcbiAgICB9XG4gICAgcHJvY2Vzcy5leGl0KClcbiAgfVxuXG4gIHBhcnNlTWFzdGVyTGluZShsaW5lKSB7XG4gICAgY29uc3QgaW5wdXQgPSBKU09OLnBhcnNlKGxpbmUpXG4gICAgaWYgKGlucHV0LmNvbW1hbmQgPT09ICdpbml0aWFsaXplJykge1xuICAgICAgdGhpcy5pbml0aWFsaXplKGlucHV0KVxuICAgIH0gZWxzZSBpZiAoaW5wdXQuY29tbWFuZCA9PT0gJ2ZpbmFsaXplJykge1xuICAgICAgdGhpcy5maW5hbGl6ZSgpXG4gICAgfSBlbHNlIGlmIChpbnB1dC5jb21tYW5kID09PSAncnVuJykge1xuICAgICAgdGhpcy5ydW5UZXN0Q2FzZShpbnB1dClcbiAgICB9XG4gIH1cblxuICBhc3luYyBydW4oKSB7XG4gICAgdGhpcy5ybCA9IHJlYWRsaW5lLmNyZWF0ZUludGVyZmFjZSh7IGlucHV0OiB0aGlzLnN0ZGluIH0pXG4gICAgdGhpcy5ybC5vbignbGluZScsIGxpbmUgPT4ge1xuICAgICAgdGhpcy5wYXJzZU1hc3RlckxpbmUobGluZSlcbiAgICB9KVxuICB9XG5cbiAgYXN5bmMgcnVuVGVzdENhc2UoeyB0ZXN0Q2FzZSwgc2tpcCB9KSB7XG4gICAgY29uc3QgdGVzdENhc2VSdW5uZXIgPSBuZXcgVGVzdENhc2VSdW5uZXIoe1xuICAgICAgZXZlbnRCcm9hZGNhc3RlcjogdGhpcy5ldmVudEJyb2FkY2FzdGVyLFxuICAgICAgc2tpcCxcbiAgICAgIHN1cHBvcnRDb2RlTGlicmFyeTogdGhpcy5zdXBwb3J0Q29kZUxpYnJhcnksXG4gICAgICB0ZXN0Q2FzZSxcbiAgICAgIHdvcmxkUGFyYW1ldGVyczogdGhpcy53b3JsZFBhcmFtZXRlcnMsXG4gICAgfSlcbiAgICBhd2FpdCB0ZXN0Q2FzZVJ1bm5lci5ydW4oKVxuICAgIHRoaXMuc3Rkb3V0LndyaXRlKEpTT04uc3RyaW5naWZ5KHsgY29tbWFuZDogY29tbWFuZFR5cGVzLlJFQURZIH0pICsgJ1xcbicpXG4gIH1cblxuICBhc3luYyBydW5UZXN0UnVuSG9va3Moa2V5LCBuYW1lKSB7XG4gICAgYXdhaXQgUHJvbWlzZS5lYWNoKHRoaXMuc3VwcG9ydENvZGVMaWJyYXJ5W2tleV0sIGFzeW5jIGhvb2tEZWZpbml0aW9uID0+IHtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IFVzZXJDb2RlUnVubmVyLnJ1bih7XG4gICAgICAgIGFyZ3NBcnJheTogW10sXG4gICAgICAgIGZuOiBob29rRGVmaW5pdGlvbi5jb2RlLFxuICAgICAgICB0aGlzQXJnOiBudWxsLFxuICAgICAgICB0aW1lb3V0SW5NaWxsaXNlY29uZHM6XG4gICAgICAgICAgaG9va0RlZmluaXRpb24ub3B0aW9ucy50aW1lb3V0IHx8XG4gICAgICAgICAgdGhpcy5zdXBwb3J0Q29kZUxpYnJhcnkuZGVmYXVsdFRpbWVvdXQsXG4gICAgICB9KVxuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gZm9ybWF0TG9jYXRpb24oaG9va0RlZmluaXRpb24pXG4gICAgICAgIHRocm93IG5ldyBWRXJyb3IoXG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgYCR7bmFtZX0gaG9vayBlcnJvcmVkLCBwcm9jZXNzIGV4aXRpbmc6ICR7bG9jYXRpb259YFxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuIl19