// Sample data.
var DATA = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
  'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'NewHampshire',
  'NewJersey', 'NewMexico', 'NewYork', 'NorthCarolina', 'NorthDakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'RhodeIsland',
  'SouthCarolina', 'SouthDakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'WestVirginia', 'Wisconsin', 'Wyoming'
];

// Returns values that start with term.
var filterData = function(term) {
  return DATA.filter(function(v) {
    return v.toLowerCase().lastIndexOf(term.toLowerCase(), 0) === 0;
  });
};

var demo1 = new TextAssist(document.getElementById('demo1'), {
  find: function(term, callback) {
    callback(filterData(term));
  }
});

var demo2 = new TextAssist(document.getElementById('demo2'), {
  find: function(term, callback) {
    // Looks like ajax.
    setTimeout(function() {
      callback(filterData(term));
    }, 300);
  },
  ulClassName: 'dropdown-menu',
  anchorClassName: 'dropdown-item',
  activeClassName: 'active',
  item: function(source, term) {
    var capitalized = term;
    if (capitalized) {
      capitalized = term.charAt(0).toUpperCase() + term.slice(1);
    }
    return source.replace(capitalized, '<u>' + capitalized + '</u>');
  },
  loadingHTML: '<img src="images/loading.gif" /><span>Now loading...</span>',
  noneHTML: '<img src="images/not-found.png" /><span>Nothing found.</span>'
});

$('#demo3').textassist({
  find: function(term, callback) {
    callback(filterData(term));
  },
  beforeFix: function(source) {
    return '"' + source + '"';
  },
  afterFix: function(value) {
    console.log('Applied value = ' + value);
  }
});