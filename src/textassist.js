/*!
 * Text Assist
 * 
 * version: 0.1
 * Copyright (c) 2015 iz-j
 */

/**
 * @param textarea
 * @param options
 */
var TextAssist = function(textarea, options) {
  // Options;
  var _op = {
    find: function(term, callback) { throw '"find" function is required!'; },
    ulClassName: null,
    liClassName: null,
    anchorClassName: null,
    activeClassName: null,
    item: function(value, term) { return value; },
    loadingHTML: '<a href="javasript:void(0)">Loading...</a>',
    noneHTML: '<a href="javasript:void(0)">No items...</a>',
    delayMills: 200
  };
  
  Object.keys(_op).forEach(function(name) {
    if (name in options) {
      _op[name] = options[name];
    }
  });
  
  // Variables.
  var _elmTx = textarea;
  
  var _elmRoot = null;
  var _elmUl = null;
  var _elmCalc = null;
  
  var _ready = false;
  var _term = null;
  var _elmSelected = null;
  
  var _fireTimerId = null;
  
  // Constants.
  var REG = /(^|\s)([^\s]*)$/;
  
  var IMPORTANT_LIST_STYLE = {
    'position': 'absolute',
    'overflowX': 'hidden',
    'overflowY': 'auto'
  };
  
  var DEFAULT_LIST_STYLE = {
    'list-style': 'none',
    'border': 'solid 1px silver',
    'background': 'white',
    'boxShadow': '0px 3px 6px gray',
    'padding': '4px',
    'margin': '2px',
    'maxHeight': '120px'
  };
  
  var DEFAULT_ITEM_NORMAL_STYLE = {
    'whiteSpace': 'nowrap',
    'cursor': 'default',
    'display': 'block',
    'padding': '2px 20px 2px 4px',
    'background': 'white',
    'color': 'black'
  };
  
  var DEFAULT_ITEM_ACTIVE_STYLE = {
    'background': 'gray',
    'color': 'white'
  };
  
  var CALC_AREA_STYLE = {
    'visibility': 'hidden',
    'position': 'absolute',
    'left': '0px',
    'top': '0px',
    'whiteSpace': 'nowrap'
  };
  
  // Initialization.
  _elmTx.wrap = 'off';
  _initDom();
  _elmTx.addEventListener('keydown', _handleTxKeyDown);
  _elmTx.addEventListener('blur', _handleTxBlur);
  _elmUl.addEventListener('click', _handleListClick);
  
  // PRIVATE -------------------------------------------------------------------
  function _initDom() {
    // Root.
    _elmRoot = document.createElement('div');
    // Suggest area.
    _elmUl = document.createElement('ul');
    _elmUl.tabIndex = -1;
    _elmUl.style.display  = 'none';
    _applyStyle(_elmUl, IMPORTANT_LIST_STYLE);
    if (_op.ulClassName) {
      _elmUl.className = _op.ulClassName;
    } else {
      _applyStyle(_elmUl, DEFAULT_LIST_STYLE);
    }
    _elmRoot.appendChild(_elmUl);
    // For calculate position.
    _elmCalc = document.createElement('div');
    _applyStyle(_elmCalc, CALC_AREA_STYLE);
    _elmRoot.appendChild(_elmCalc);
    
    document.body.appendChild(_elmRoot);
  }
  
  function _handleTxKeyDown(e) {
    switch (e.keyCode) {
      case 8:// BackSpace
        if (_isListVisible()) {
          if (_term) {
            _fireAssist();  
          } else {
            hide();
          }
        }
        break;
      case 9:// Tab
        break;
      case 13:// Enter
        if (_ready) {
          e.preventDefault();
          _fixSelected();
        } else {
          hide();
        }
        break;
      case 27:// ESC
        hide();
        break;
      case 32:// Space
        if (e.ctrlKey) {
          e.preventDefault();
          if (!_isListVisible()) {
            _fireAssist();
          } else {
            hide();
          }
        } else {
          hide();
        }
        break;
      case 38:// up
        if (_ready) {
          e.preventDefault();
          _selectPrev();
        }
        break;
      case 40:// down
        if (_ready) {
          e.preventDefault();
          _selectNext();
        }
        break;
      case 37:// left
      case 39:// right
        if (_isListVisible()) {
          _fireAssist();
        }
        break; 
      case 33:// PgUp
      case 34:// PgDw
      case 35:// Home
      case 36:// End
        hide();
        break;
      default:
        if (_isListVisible()) {
          _fireAssist();
        }
        break;
    }
  }
  
  function _handleTxBlur(e) {
    if (e.relatedTarget !== _elmUl) {
      hide(); 
    }
  }
  
  function _handleListClick(e) {
    // Find anchor and fix selection.
    var elm = e.target;
    while (elm && elm !== _elmUl) {
      if (e.target.tagName === 'A' && elm.dataset.value) {
        _elmSelected = elm;
        _fixSelected();
        break;
      }
      elm = elm.parentNode;
    }  
  }
  
  function _fireAssist() {
    if (_fireTimerId) {
      clearTimeout(_fireTimerId);
    }
    _fireTimerId = setTimeout(_fireAssistActually, _op.delayMills);
  }
  
  function _fireAssistActually() {
    _ready = false;
    _elmSelected = null;
    
    // Initialize suggest area.
    while (_elmUl.lastChild) {
      _elmUl.removeChild(_elmUl.lastChild);
    }
    var li = document.createElement('li');
    li.innerHTML = _op.loadingHTML;
    _elmUl.appendChild(li);
    
    var pos = _calcPosForSuggest();
    _elmUl.style.left = pos.left + 'px';
    _elmUl.style.top = pos.top + 'px';
    _elmUl.style.display = 'block';
    
    // Call function to find values.
    _determineTerm();
    _op.find(_term, _findCallback);
  }
  
  function _determineTerm() {
    var s = _elmTx.value.slice(0, _elmTx.selectionStart);
    var m = s.match(REG);
    _term = m ? m[2] : '';
  }
  
  function _findCallback(values) {
    // No data.
    if (!values || values.length === 0) {
      _elmUl.firstChild.innerHTML = _op.noneHTML;
      return;
    }
    // Show list.
    _elmUl.removeChild(_elmUl.firstChild);
    values.forEach(function(val) {
      var li = document.createElement('li');
      var a  = document.createElement('a');
      li.appendChild(a);
      if (_op.liClassName) {
        li.className = _op.liClassName;
      }
      if (_op.anchorClassName) {
        a.className = _op.anchorClassName;
      } else {
        _applyStyle(a, DEFAULT_ITEM_NORMAL_STYLE);
      }
      a.dataset.value = val;
      a.innerHTML = _op.item(val, _term);
      _elmUl.appendChild(li);
      // Select first item.
      if (!_elmSelected) {
        _switchSelected(a);
        _elmUl.scrollTop = 0;
      }
    });
    
    _ready = true;
  }
  
  function _selectNext() {
    if (!_elmSelected.parentNode.nextSibling) {
      return;
    }
    _switchSelected(_elmSelected.parentNode.nextSibling.firstChild);
  }
  
  function _selectPrev() {
    if (!_elmSelected.parentNode.previousSibling) {
      return;
    }
    _switchSelected(_elmSelected.parentNode.previousSibling.firstChild);
  }
  
  function _switchSelected(elmNew) {
    if (!_op.anchorClassName) {
      if (_elmSelected) {
        _applyStyle(_elmSelected, DEFAULT_ITEM_NORMAL_STYLE);
      }
      _applyStyle(elmNew, DEFAULT_ITEM_ACTIVE_STYLE);
    }
    if (_op.activeClassName) {
      if (_elmSelected) {
        _elmSelected.parentNode.classList.remove(_op.activeClassName);
      }
      elmNew.parentNode.classList.add(_op.activeClassName);
    }
    _elmSelected = elmNew;
    _selectedToVisible();
  }
  
  function _selectedToVisible() {
    var visibleStart = _elmUl.scrollTop;
    var visibleEnd   = _elmUl.offsetHeight + _elmUl.scrollTop - _elmSelected.parentNode.offsetHeight;
    if (_elmSelected.offsetTop < visibleStart) {
      _elmUl.scrollTop = _elmSelected.offsetTop;
    } else if (_elmSelected.offsetTop > visibleEnd) {
      _elmUl.scrollTop = _elmUl.scrollTop + (_elmSelected.offsetTop - visibleEnd);
    }
  }
  
  function _fixSelected() {
    var val = _elmSelected.dataset.value;
    var fore = _elmTx.value.slice(0, _elmTx.selectionStart);
    var aft  = _elmTx.value.slice(_elmTx.selectionStart, _elmTx.value.length);
    // Replace term to selected value and join parts.
    fore = fore.replace(new RegExp(_term + '$'), val);
    _elmTx.value = fore + aft;
    // Caret to target pos.
    _elmTx.focus();
    _elmTx.selectionStart = fore.length;
    _elmTx.selectionEnd = fore.length;
    hide();
  }
  
  function _applyStyle(element, style) {
    Object.keys(style).forEach(function(name) {
      element.style[name] = style[name];
    });
  }
  
  function _isListVisible() {
    return _elmUl.style.display !== 'none';
  }
  
  var STYLES_FOR_CALC_POS = [
    'width','height',
    'borderBottomWidth','borderLeftWidth','borderRightWidth','borderTopWidth',
    'fontFamily','fontSize','fontStyle','fontVariant','fontWeight',
    'letterSpacing','wordSpacing','lineHeight','textDecoration',
    'paddingBottom','paddingLeft','paddingRight','paddingTop'
  ];
  
  function _calcPosForSuggest() {
    // Setup styles to calculate position.
    var txStyle = document.defaultView.getComputedStyle(_elmTx, '');
    STYLES_FOR_CALC_POS.forEach(function(name) {
      _elmCalc.style[name] = txStyle[name];
    });
    _elmCalc.style.overflow = 'auto';
		
		// Extract text.
		var textAll = _elmTx.value;
		var textL   = textAll.slice(0, _elmTx.selectionStart);
		var textSel = textAll.slice(_elmTx.selectionStart, _elmTx.selectionEnd);
		var textR   = textAll.slice(_elmTx.selectionEnd, textAll.length);
		if(!textSel) {
		  textSel = '|';
		}
		
		// Setup text to calculate position.
		_elmCalc.innerHTML = 
		    _textToCalc(textL) +
        '<span class="textassist-caret">' +
        _textToCalc(textSel) +
        '</span>' +
				_textToCalc(textR);
			
		// Calculate position for suggest area.
		_elmCalc.scrollLeft = _elmTx.scrollLeft;
		_elmCalc.scrollTop  = _elmTx.scrollTop;
		
		var elmCaret = _elmCalc.querySelector('.textassist-caret');
		
		var posTx = _getAbsPosOf(_elmTx);
		var posCalc = _getAbsPosOf(_elmCalc);
		var posCaret = _getAbsPosOf(elmCaret);
		return {
		  left: posTx.left + (posCaret.left - posCalc.left),
		  top: posTx.top + (posCaret.top - posCalc.top + elmCaret.offsetHeight)
		};
  }
  
  var ESCAPE_CHARS = {
    '&': '&amp;',
    '"': '&quot;',
    '<': '&lt;',
    '>': '&gt;'
  };
  
  function _textToCalc(text) {
    return text.replace(/[&"<>]/g, function(match) {
      return ESCAPE_CHARS[match];
    }).replace(/\r?\n/g, '<br />');
  }
  
  function _getAbsPosOf(element) {
    var top = 0, left = 0;
    do {
        top += element.offsetTop  || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while(element);

    return { top: top, left: left };
  }
  
  // PUBLIC --------------------------------------------------------------------
  function hide() {
    _elmUl.style.display = 'none';
    _ready = false;
  }
  
  function destroy() {
    _elmTx.removeEventListener('keydown', _handleTxKeyDown);
    _elmTx.removeEventListener('blur', _handleTxBlur);
    _elmUl.removeEventListener('click', _handleListClick);
    
    _elmTx = null;
    _op = null;
    
    _elmRoot.remove();
    _elmRoot = null;
    _elmUl = null;
    _elmCalc = null;
    _elmSelected = null;
  }
  
  return {
    'hide': hide,
    'destroy': destroy
  };
};