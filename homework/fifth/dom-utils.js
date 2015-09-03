/**
 * DomUtils
 */
(function(window) {
  'use strict';

  var _inputs = [
    'shape', 'shapeColor',
    'rotateX', 'rotateY', 'rotateZ',
    'scaleX', 'scaleY', 'scaleZ',
    'translateX', 'translateY', 'translateZ'
  ];

  var DomUtils = {

    getCheckedValue: function(elementName) {
      var checkedVal,
        values = document.getElementsByName(elementName);

      for (var i = 0; i < values.length; i++) {
        if (values[i].checked) {
            checkedVal = values[i].value;
            break;
        }
      }

      return checkedVal;
    },

    getCheckedNumber: function(elementName) {
      var val = this.getCheckedValue(elementName);
      return val ? parseInt(val, 10) : null;
    },

    disableInputs: function() {
      _inputs.forEach(function(input) {
        document.getElementById(input).disabled = true;
      });
    },

    enableInputs: function() {
      _inputs.forEach(function(input) {
        document.getElementById(input).disabled = false;
      });
    },

    removeOptions: function(elementId) {
      var selectBox = document.getElementById(elementId);
      for(var i=selectBox.options.length-1; i>=0; i--) {
        selectBox.remove(i);
      }
    }

  };

  window.DomUtils = DomUtils;

})(window);
