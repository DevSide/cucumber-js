'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _CHARACTERS, _IS_ISSUE;

exports.isIssue = isIssue;
exports.formatIssue = formatIssue;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _location_helpers = require('./location_helpers');

var _step_result_helpers = require('./step_result_helpers');

var _indentString = require('indent-string');

var _indentString2 = _interopRequireDefault(_indentString);

var _status = require('../../status');

var _status2 = _interopRequireDefault(_status);

var _figures = require('figures');

var _figures2 = _interopRequireDefault(_figures);

var _cliTable = require('cli-table');

var _cliTable2 = _interopRequireDefault(_cliTable);

var _keyword_type = require('./keyword_type');

var _keyword_type2 = _interopRequireDefault(_keyword_type);

var _step_arguments = require('../../step_arguments');

var _gherkin_document_parser = require('./gherkin_document_parser');

var _pickle_parser = require('./pickle_parser');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CHARACTERS = (_CHARACTERS = {}, (0, _defineProperty3.default)(_CHARACTERS, _status2.default.AMBIGUOUS, _figures2.default.cross), (0, _defineProperty3.default)(_CHARACTERS, _status2.default.FAILED, _figures2.default.cross), (0, _defineProperty3.default)(_CHARACTERS, _status2.default.PASSED, _figures2.default.tick), (0, _defineProperty3.default)(_CHARACTERS, _status2.default.PENDING, '?'), (0, _defineProperty3.default)(_CHARACTERS, _status2.default.SKIPPED, '-'), (0, _defineProperty3.default)(_CHARACTERS, _status2.default.UNDEFINED, '?'), _CHARACTERS);

var IS_ISSUE = (_IS_ISSUE = {}, (0, _defineProperty3.default)(_IS_ISSUE, _status2.default.AMBIGUOUS, true), (0, _defineProperty3.default)(_IS_ISSUE, _status2.default.FAILED, true), (0, _defineProperty3.default)(_IS_ISSUE, _status2.default.PASSED, false), (0, _defineProperty3.default)(_IS_ISSUE, _status2.default.PENDING, true), (0, _defineProperty3.default)(_IS_ISSUE, _status2.default.SKIPPED, false), (0, _defineProperty3.default)(_IS_ISSUE, _status2.default.UNDEFINED, true), _IS_ISSUE);

function formatDataTable(arg) {
  var rows = arg.rows.map(function (row) {
    return row.cells.map(function (cell) {
      return cell.value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
    });
  });
  var table = new _cliTable2.default({
    chars: {
      bottom: '',
      'bottom-left': '',
      'bottom-mid': '',
      'bottom-right': '',
      left: '|',
      'left-mid': '',
      mid: '',
      'mid-mid': '',
      middle: '|',
      right: '|',
      'right-mid': '',
      top: '',
      'top-left': '',
      'top-mid': '',
      'top-right': ''
    },
    style: {
      border: [],
      'padding-left': 1,
      'padding-right': 1
    }
  });
  table.push.apply(table, (0, _toConsumableArray3.default)(rows));
  return table.toString();
}

function formatDocString(arg) {
  return '"""\n' + arg.content + '\n"""';
}

function formatStep(_ref) {
  var colorFns = _ref.colorFns,
      isBeforeHook = _ref.isBeforeHook,
      keyword = _ref.keyword,
      keywordType = _ref.keywordType,
      pickleStep = _ref.pickleStep,
      snippetBuilder = _ref.snippetBuilder,
      testStep = _ref.testStep;
  var status = testStep.result.status;

  var colorFn = colorFns[status];

  var identifier = void 0;
  if (testStep.sourceLocation) {
    identifier = keyword + (pickleStep.text || '');
  } else {
    identifier = isBeforeHook ? 'Before' : 'After';
  }

  var text = colorFn(CHARACTERS[status] + ' ' + identifier);

  var actionLocation = testStep.actionLocation;

  if (actionLocation) {
    text += ' # ' + colorFns.location((0, _location_helpers.formatLocation)(actionLocation));
  }
  text += '\n';

  if (Array.isArray(testStep.attachments)) {
    testStep.attachments.filter(function (_ref2) {
      var media = _ref2.media;
      return media.type === 'text/plain';
    }).forEach(function (_ref3) {
      var data = _ref3.data;

      text += (0, _indentString2.default)(colorFns[_status2.default.UNDEFINED](_figures2.default.info + ' ' + data), 4) + '\n';
    });
  }

  if (pickleStep) {
    var str = void 0;
    var iterator = (0, _step_arguments.buildStepArgumentIterator)({
      dataTable: function dataTable(arg) {
        return str = formatDataTable(arg);
      },
      docString: function docString(arg) {
        return str = formatDocString(arg);
      }
    });
    _lodash2.default.each(pickleStep.arguments, iterator);
    if (str) {
      text += (0, _indentString2.default)(colorFn(str) + '\n', 4);
    }
  }
  var message = (0, _step_result_helpers.getStepMessage)({
    colorFns: colorFns,
    keywordType: keywordType,
    pickleStep: pickleStep,
    snippetBuilder: snippetBuilder,
    testStep: testStep
  });
  if (message) {
    text += (0, _indentString2.default)(message, 4) + '\n';
  }
  return text;
}

function isIssue(status) {
  return IS_ISSUE[status];
}

function formatIssue(_ref4) {
  var colorFns = _ref4.colorFns,
      gherkinDocument = _ref4.gherkinDocument,
      number = _ref4.number,
      pickle = _ref4.pickle,
      snippetBuilder = _ref4.snippetBuilder,
      testCase = _ref4.testCase;

  var prefix = number + ') ';
  var text = prefix;
  var scenarioLocation = (0, _location_helpers.formatLocation)(testCase.sourceLocation);
  text += 'Scenario: ' + pickle.name + ' # ' + colorFns.location(scenarioLocation) + '\n';
  var stepLineToKeywordMap = (0, _gherkin_document_parser.getStepLineToKeywordMap)(gherkinDocument);
  var stepLineToPickledStepMap = (0, _pickle_parser.getStepLineToPickledStepMap)(pickle);
  var isBeforeHook = true;
  var previousKeywordType = _keyword_type2.default.PRECONDITION;
  _lodash2.default.each(testCase.steps, function (testStep) {
    isBeforeHook = isBeforeHook && !testStep.sourceLocation;
    var keyword = void 0,
        keywordType = void 0,
        pickleStep = void 0;
    if (testStep.sourceLocation) {
      pickleStep = stepLineToPickledStepMap[testStep.sourceLocation.line];
      keyword = (0, _pickle_parser.getStepKeyword)({ pickleStep: pickleStep, stepLineToKeywordMap: stepLineToKeywordMap });
      keywordType = (0, _keyword_type.getStepKeywordType)({
        keyword: keyword,
        language: gherkinDocument.feature.language,
        previousKeywordType: previousKeywordType
      });
    }
    var formattedStep = formatStep({
      colorFns: colorFns,
      isBeforeHook: isBeforeHook,
      keyword: keyword,
      keywordType: keywordType,
      pickleStep: pickleStep,
      snippetBuilder: snippetBuilder,
      testStep: testStep
    });
    text += (0, _indentString2.default)(formattedStep, prefix.length);
    previousKeywordType = keywordType;
  });
  return text + '\n';
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9mb3JtYXR0ZXIvaGVscGVycy9pc3N1ZV9oZWxwZXJzLmpzIl0sIm5hbWVzIjpbImlzSXNzdWUiLCJmb3JtYXRJc3N1ZSIsIkNIQVJBQ1RFUlMiLCJBTUJJR1VPVVMiLCJjcm9zcyIsIkZBSUxFRCIsIlBBU1NFRCIsInRpY2siLCJQRU5ESU5HIiwiU0tJUFBFRCIsIlVOREVGSU5FRCIsIklTX0lTU1VFIiwiZm9ybWF0RGF0YVRhYmxlIiwiYXJnIiwicm93cyIsIm1hcCIsInJvdyIsImNlbGxzIiwiY2VsbCIsInZhbHVlIiwicmVwbGFjZSIsInRhYmxlIiwiY2hhcnMiLCJib3R0b20iLCJsZWZ0IiwibWlkIiwibWlkZGxlIiwicmlnaHQiLCJ0b3AiLCJzdHlsZSIsImJvcmRlciIsInB1c2giLCJ0b1N0cmluZyIsImZvcm1hdERvY1N0cmluZyIsImNvbnRlbnQiLCJmb3JtYXRTdGVwIiwiY29sb3JGbnMiLCJpc0JlZm9yZUhvb2siLCJrZXl3b3JkIiwia2V5d29yZFR5cGUiLCJwaWNrbGVTdGVwIiwic25pcHBldEJ1aWxkZXIiLCJ0ZXN0U3RlcCIsInN0YXR1cyIsInJlc3VsdCIsImNvbG9yRm4iLCJpZGVudGlmaWVyIiwic291cmNlTG9jYXRpb24iLCJ0ZXh0IiwiYWN0aW9uTG9jYXRpb24iLCJsb2NhdGlvbiIsIkFycmF5IiwiaXNBcnJheSIsImF0dGFjaG1lbnRzIiwiZmlsdGVyIiwibWVkaWEiLCJ0eXBlIiwiZm9yRWFjaCIsImRhdGEiLCJpbmZvIiwic3RyIiwiaXRlcmF0b3IiLCJkYXRhVGFibGUiLCJkb2NTdHJpbmciLCJlYWNoIiwiYXJndW1lbnRzIiwibWVzc2FnZSIsImdoZXJraW5Eb2N1bWVudCIsIm51bWJlciIsInBpY2tsZSIsInRlc3RDYXNlIiwicHJlZml4Iiwic2NlbmFyaW9Mb2NhdGlvbiIsIm5hbWUiLCJzdGVwTGluZVRvS2V5d29yZE1hcCIsInN0ZXBMaW5lVG9QaWNrbGVkU3RlcE1hcCIsInByZXZpb3VzS2V5d29yZFR5cGUiLCJQUkVDT05ESVRJT04iLCJzdGVwcyIsImxpbmUiLCJsYW5ndWFnZSIsImZlYXR1cmUiLCJmb3JtYXR0ZWRTdGVwIiwibGVuZ3RoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O1FBbUlnQkEsTyxHQUFBQSxPO1FBSUFDLFcsR0FBQUEsVzs7QUF2SWhCOzs7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUNBOztBQUNBOzs7O0FBRUEsSUFBTUMsMkVBQ0gsaUJBQU9DLFNBREosRUFDZ0Isa0JBQVFDLEtBRHhCLDhDQUVILGlCQUFPQyxNQUZKLEVBRWEsa0JBQVFELEtBRnJCLDhDQUdILGlCQUFPRSxNQUhKLEVBR2Esa0JBQVFDLElBSHJCLDhDQUlILGlCQUFPQyxPQUpKLEVBSWMsR0FKZCw4Q0FLSCxpQkFBT0MsT0FMSixFQUtjLEdBTGQsOENBTUgsaUJBQU9DLFNBTkosRUFNZ0IsR0FOaEIsZUFBTjs7QUFTQSxJQUFNQyxxRUFDSCxpQkFBT1IsU0FESixFQUNnQixJQURoQiw0Q0FFSCxpQkFBT0UsTUFGSixFQUVhLElBRmIsNENBR0gsaUJBQU9DLE1BSEosRUFHYSxLQUhiLDRDQUlILGlCQUFPRSxPQUpKLEVBSWMsSUFKZCw0Q0FLSCxpQkFBT0MsT0FMSixFQUtjLEtBTGQsNENBTUgsaUJBQU9DLFNBTkosRUFNZ0IsSUFOaEIsYUFBTjs7QUFTQSxTQUFTRSxlQUFULENBQXlCQyxHQUF6QixFQUE4QjtBQUM1QixNQUFNQyxPQUFPRCxJQUFJQyxJQUFKLENBQVNDLEdBQVQsQ0FBYTtBQUFBLFdBQ3hCQyxJQUFJQyxLQUFKLENBQVVGLEdBQVYsQ0FBYztBQUFBLGFBQ1pHLEtBQUtDLEtBQUwsQ0FBV0MsT0FBWCxDQUFtQixLQUFuQixFQUEwQixNQUExQixFQUFrQ0EsT0FBbEMsQ0FBMEMsS0FBMUMsRUFBaUQsS0FBakQsQ0FEWTtBQUFBLEtBQWQsQ0FEd0I7QUFBQSxHQUFiLENBQWI7QUFLQSxNQUFNQyxRQUFRLHVC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QUFhbUMseUJBQXlCakMsU0FBU0ssY0FBVCxDQUF3QmdDLElBQWpELENBQWI7QUFDQXpDLGdCQUFVLG1DQUFlLEVBQUVFLHNCQUFGLEVBQWNrQywwQ0FBZCxFQUFmLENBQVY7QUFDQW5DLG9CQUFjLHNDQUFtQjtBQUMvQkQsd0JBRCtCO0FBRS9CMEMsa0JBQVViLGdCQUFnQmMsT0FBaEIsQ0FBd0JELFFBRkg7QUFHL0JKO0FBSCtCLE9BQW5CLENBQWQ7QUFLRDtBQUNELFFBQU1NLGdCQUFnQi9DLFdBQVc7QUFDL0JDLHdCQUQrQjtBQUUvQkMsZ0NBRitCO0FBRy9CQyxzQkFIK0I7QUFJL0JDLDhCQUorQjtBQUsvQkMsNEJBTCtCO0FBTS9CQyxvQ0FOK0I7QUFPL0JDO0FBUCtCLEtBQVgsQ0FBdEI7QUFTQU0sWUFBUSw0QkFBYWtDLGFBQWIsRUFBNEJYLE9BQU9ZLE1BQW5DLENBQVI7QUFDQVAsMEJBQXNCckMsV0FBdEI7QUFDRCxHQXZCRDtBQXdCQSxTQUFVUyxJQUFWO0FBQ0QiLCJmaWxlIjoiaXNzdWVfaGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBfIGZyb20gJ2xvZGFzaCdcbmltcG9ydCB7IGZvcm1hdExvY2F0aW9uIH0gZnJvbSAnLi9sb2NhdGlvbl9oZWxwZXJzJ1xuaW1wb3J0IHsgZ2V0U3RlcE1lc3NhZ2UgfSBmcm9tICcuL3N0ZXBfcmVzdWx0X2hlbHBlcnMnXG5pbXBvcnQgaW5kZW50U3RyaW5nIGZyb20gJ2luZGVudC1zdHJpbmcnXG5pbXBvcnQgU3RhdHVzIGZyb20gJy4uLy4uL3N0YXR1cydcbmltcG9ydCBmaWd1cmVzIGZyb20gJ2ZpZ3VyZXMnXG5pbXBvcnQgVGFibGUgZnJvbSAnY2xpLXRhYmxlJ1xuaW1wb3J0IEtleXdvcmRUeXBlLCB7IGdldFN0ZXBLZXl3b3JkVHlwZSB9IGZyb20gJy4va2V5d29yZF90eXBlJ1xuaW1wb3J0IHsgYnVpbGRTdGVwQXJndW1lbnRJdGVyYXRvciB9IGZyb20gJy4uLy4uL3N0ZXBfYXJndW1lbnRzJ1xuaW1wb3J0IHsgZ2V0U3RlcExpbmVUb0tleXdvcmRNYXAgfSBmcm9tICcuL2doZXJraW5fZG9jdW1lbnRfcGFyc2VyJ1xuaW1wb3J0IHsgZ2V0U3RlcExpbmVUb1BpY2tsZWRTdGVwTWFwLCBnZXRTdGVwS2V5d29yZCB9IGZyb20gJy4vcGlja2xlX3BhcnNlcidcblxuY29uc3QgQ0hBUkFDVEVSUyA9IHtcbiAgW1N0YXR1cy5BTUJJR1VPVVNdOiBmaWd1cmVzLmNyb3NzLFxuICBbU3RhdHVzLkZBSUxFRF06IGZpZ3VyZXMuY3Jvc3MsXG4gIFtTdGF0dXMuUEFTU0VEXTogZmlndXJlcy50aWNrLFxuICBbU3RhdHVzLlBFTkRJTkddOiAnPycsXG4gIFtTdGF0dXMuU0tJUFBFRF06ICctJyxcbiAgW1N0YXR1cy5VTkRFRklORURdOiAnPycsXG59XG5cbmNvbnN0IElTX0lTU1VFID0ge1xuICBbU3RhdHVzLkFNQklHVU9VU106IHRydWUsXG4gIFtTdGF0dXMuRkFJTEVEXTogdHJ1ZSxcbiAgW1N0YXR1cy5QQVNTRURdOiBmYWxzZSxcbiAgW1N0YXR1cy5QRU5ESU5HXTogdHJ1ZSxcbiAgW1N0YXR1cy5TS0lQUEVEXTogZmFsc2UsXG4gIFtTdGF0dXMuVU5ERUZJTkVEXTogdHJ1ZSxcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0YVRhYmxlKGFyZykge1xuICBjb25zdCByb3dzID0gYXJnLnJvd3MubWFwKHJvdyA9PlxuICAgIHJvdy5jZWxscy5tYXAoY2VsbCA9PlxuICAgICAgY2VsbC52YWx1ZS5yZXBsYWNlKC9cXFxcL2csICdcXFxcXFxcXCcpLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKVxuICAgIClcbiAgKVxuICBjb25zdCB0YWJsZSA9IG5ldyBUYWJsZSh7XG4gICAgY2hhcnM6IHtcbiAgICAgIGJvdHRvbTogJycsXG4gICAgICAnYm90dG9tLWxlZnQnOiAnJyxcbiAgICAgICdib3R0b20tbWlkJzogJycsXG4gICAgICAnYm90dG9tLXJpZ2h0JzogJycsXG4gICAgICBsZWZ0OiAnfCcsXG4gICAgICAnbGVmdC1taWQnOiAnJyxcbiAgICAgIG1pZDogJycsXG4gICAgICAnbWlkLW1pZCc6ICcnLFxuICAgICAgbWlkZGxlOiAnfCcsXG4gICAgICByaWdodDogJ3wnLFxuICAgICAgJ3JpZ2h0LW1pZCc6ICcnLFxuICAgICAgdG9wOiAnJyxcbiAgICAgICd0b3AtbGVmdCc6ICcnLFxuICAgICAgJ3RvcC1taWQnOiAnJyxcbiAgICAgICd0b3AtcmlnaHQnOiAnJyxcbiAgICB9LFxuICAgIHN0eWxlOiB7XG4gICAgICBib3JkZXI6IFtdLFxuICAgICAgJ3BhZGRpbmctbGVmdCc6IDEsXG4gICAgICAncGFkZGluZy1yaWdodCc6IDEsXG4gICAgfSxcbiAgfSlcbiAgdGFibGUucHVzaCguLi5yb3dzKVxuICByZXR1cm4gdGFibGUudG9TdHJpbmcoKVxufVxuXG5mdW5jdGlvbiBmb3JtYXREb2NTdHJpbmcoYXJnKSB7XG4gIHJldHVybiBgXCJcIlwiXFxuJHthcmcuY29udGVudH1cXG5cIlwiXCJgXG59XG5cbmZ1bmN0aW9uIGZvcm1hdFN0ZXAoe1xuICBjb2xvckZucyxcbiAgaXNCZWZvcmVIb29rLFxuICBrZXl3b3JkLFxuICBrZXl3b3JkVHlwZSxcbiAgcGlja2xlU3RlcCxcbiAgc25pcHBldEJ1aWxkZXIsXG4gIHRlc3RTdGVwLFxufSkge1xuICBjb25zdCB7IHN0YXR1cyB9ID0gdGVzdFN0ZXAucmVzdWx0XG4gIGNvbnN0IGNvbG9yRm4gPSBjb2xvckZuc1tzdGF0dXNdXG5cbiAgbGV0IGlkZW50aWZpZXJcbiAgaWYgKHRlc3RTdGVwLnNvdXJjZUxvY2F0aW9uKSB7XG4gICAgaWRlbnRpZmllciA9IGtleXdvcmQgKyAocGlja2xlU3RlcC50ZXh0IHx8ICcnKVxuICB9IGVsc2Uge1xuICAgIGlkZW50aWZpZXIgPSBpc0JlZm9yZUhvb2sgPyAnQmVmb3JlJyA6ICdBZnRlcidcbiAgfVxuXG4gIGxldCB0ZXh0ID0gY29sb3JGbihgJHtDSEFSQUNURVJTW3N0YXR1c119ICR7aWRlbnRpZmllcn1gKVxuXG4gIGNvbnN0IHsgYWN0aW9uTG9jYXRpb24gfSA9IHRlc3RTdGVwXG4gIGlmIChhY3Rpb25Mb2NhdGlvbikge1xuICAgIHRleHQgKz0gYCAjICR7Y29sb3JGbnMubG9jYXRpb24oZm9ybWF0TG9jYXRpb24oYWN0aW9uTG9jYXRpb24pKX1gXG4gIH1cbiAgdGV4dCArPSAnXFxuJ1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHRlc3RTdGVwLmF0dGFjaG1lbnRzKSkge1xuICAgIHRlc3RTdGVwLmF0dGFjaG1lbnRzXG4gICAgICAuZmlsdGVyKCh7IG1lZGlhIH0pID0+IG1lZGlhLnR5cGUgPT09ICd0ZXh0L3BsYWluJylcbiAgICAgIC5mb3JFYWNoKCh7IGRhdGEgfSkgPT4ge1xuICAgICAgICB0ZXh0ICs9XG4gICAgICAgICAgaW5kZW50U3RyaW5nKFxuICAgICAgICAgICAgY29sb3JGbnNbU3RhdHVzLlVOREVGSU5FRF0oZmlndXJlcy5pbmZvICsgJyAnICsgZGF0YSksXG4gICAgICAgICAgICA0XG4gICAgICAgICAgKSArICdcXG4nXG4gICAgICB9KVxuICB9XG5cbiAgaWYgKHBpY2tsZVN0ZXApIHtcbiAgICBsZXQgc3RyXG4gICAgY29uc3QgaXRlcmF0b3IgPSBidWlsZFN0ZXBBcmd1bWVudEl0ZXJhdG9yKHtcbiAgICAgIGRhdGFUYWJsZTogYXJnID0+IChzdHIgPSBmb3JtYXREYXRhVGFibGUoYXJnKSksXG4gICAgICBkb2NTdHJpbmc6IGFyZyA9PiAoc3RyID0gZm9ybWF0RG9jU3RyaW5nKGFyZykpLFxuICAgIH0pXG4gICAgXy5lYWNoKHBpY2tsZVN0ZXAuYXJndW1lbnRzLCBpdGVyYXRvcilcbiAgICBpZiAoc3RyKSB7XG4gICAgICB0ZXh0ICs9IGluZGVudFN0cmluZyhgJHtjb2xvckZuKHN0cil9XFxuYCwgNClcbiAgICB9XG4gIH1cbiAgY29uc3QgbWVzc2FnZSA9IGdldFN0ZXBNZXNzYWdlKHtcbiAgICBjb2xvckZucyxcbiAgICBrZXl3b3JkVHlwZSxcbiAgICBwaWNrbGVTdGVwLFxuICAgIHNuaXBwZXRCdWlsZGVyLFxuICAgIHRlc3RTdGVwLFxuICB9KVxuICBpZiAobWVzc2FnZSkge1xuICAgIHRleHQgKz0gYCR7aW5kZW50U3RyaW5nKG1lc3NhZ2UsIDQpfVxcbmBcbiAgfVxuICByZXR1cm4gdGV4dFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJc3N1ZShzdGF0dXMpIHtcbiAgcmV0dXJuIElTX0lTU1VFW3N0YXR1c11cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdElzc3VlKHtcbiAgY29sb3JGbnMsXG4gIGdoZXJraW5Eb2N1bWVudCxcbiAgbnVtYmVyLFxuICBwaWNrbGUsXG4gIHNuaXBwZXRCdWlsZGVyLFxuICB0ZXN0Q2FzZSxcbn0pIHtcbiAgY29uc3QgcHJlZml4ID0gYCR7bnVtYmVyfSkgYFxuICBsZXQgdGV4dCA9IHByZWZpeFxuICBjb25zdCBzY2VuYXJpb0xvY2F0aW9uID0gZm9ybWF0TG9jYXRpb24odGVzdENhc2Uuc291cmNlTG9jYXRpb24pXG4gIHRleHQgKz0gYFNjZW5hcmlvOiAke3BpY2tsZS5uYW1lfSAjICR7Y29sb3JGbnMubG9jYXRpb24oc2NlbmFyaW9Mb2NhdGlvbil9XFxuYFxuICBjb25zdCBzdGVwTGluZVRvS2V5d29yZE1hcCA9IGdldFN0ZXBMaW5lVG9LZXl3b3JkTWFwKGdoZXJraW5Eb2N1bWVudClcbiAgY29uc3Qgc3RlcExpbmVUb1BpY2tsZWRTdGVwTWFwID0gZ2V0U3RlcExpbmVUb1BpY2tsZWRTdGVwTWFwKHBpY2tsZSlcbiAgbGV0IGlzQmVmb3JlSG9vayA9IHRydWVcbiAgbGV0IHByZXZpb3VzS2V5d29yZFR5cGUgPSBLZXl3b3JkVHlwZS5QUkVDT05ESVRJT05cbiAgXy5lYWNoKHRlc3RDYXNlLnN0ZXBzLCB0ZXN0U3RlcCA9PiB7XG4gICAgaXNCZWZvcmVIb29rID0gaXNCZWZvcmVIb29rICYmICF0ZXN0U3RlcC5zb3VyY2VMb2NhdGlvblxuICAgIGxldCBrZXl3b3JkLCBrZXl3b3JkVHlwZSwgcGlja2xlU3RlcFxuICAgIGlmICh0ZXN0U3RlcC5zb3VyY2VMb2NhdGlvbikge1xuICAgICAgcGlja2xlU3RlcCA9IHN0ZXBMaW5lVG9QaWNrbGVkU3RlcE1hcFt0ZXN0U3RlcC5zb3VyY2VMb2NhdGlvbi5saW5lXVxuICAgICAga2V5d29yZCA9IGdldFN0ZXBLZXl3b3JkKHsgcGlja2xlU3RlcCwgc3RlcExpbmVUb0tleXdvcmRNYXAgfSlcbiAgICAgIGtleXdvcmRUeXBlID0gZ2V0U3RlcEtleXdvcmRUeXBlKHtcbiAgICAgICAga2V5d29yZCxcbiAgICAgICAgbGFuZ3VhZ2U6IGdoZXJraW5Eb2N1bWVudC5mZWF0dXJlLmxhbmd1YWdlLFxuICAgICAgICBwcmV2aW91c0tleXdvcmRUeXBlLFxuICAgICAgfSlcbiAgICB9XG4gICAgY29uc3QgZm9ybWF0dGVkU3RlcCA9IGZvcm1hdFN0ZXAoe1xuICAgICAgY29sb3JGbnMsXG4gICAgICBpc0JlZm9yZUhvb2ssXG4gICAgICBrZXl3b3JkLFxuICAgICAga2V5d29yZFR5cGUsXG4gICAgICBwaWNrbGVTdGVwLFxuICAgICAgc25pcHBldEJ1aWxkZXIsXG4gICAgICB0ZXN0U3RlcCxcbiAgICB9KVxuICAgIHRleHQgKz0gaW5kZW50U3RyaW5nKGZvcm1hdHRlZFN0ZXAsIHByZWZpeC5sZW5ndGgpXG4gICAgcHJldmlvdXNLZXl3b3JkVHlwZSA9IGtleXdvcmRUeXBlXG4gIH0pXG4gIHJldHVybiBgJHt0ZXh0fVxcbmBcbn1cbiJdfQ==