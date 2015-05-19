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

var filterData = function(term) {
  return DATA.filter(function(v) {
    return v.toLowerCase().lastIndexOf(term.toLowerCase(), 0) === 0;
  });
};

var ta1 = new TextAssist(document.getElementById('sample1'), {
  find: function(term, callback) {
    console.log('term = ' + term);
    callback(filterData(term));
  }
});

var ta2 = new TextAssist(document.getElementById('sample2'), {
  find: function(term, callback) {
    console.log('term = ' + term);
    setTimeout(function() {
      callback(filterData(term));
    }, 200);
  },
  ulClassName: 'dropdown-menu',
  liClassName: 'sample2-li',
  anchorClassName: 'sample2-a',
  activeClassName: 'active',
  item: function(source, term) {
    return source.replace(term, '<b>' + term + '</b>');
  },
  loadingHTML: '<span class="label label-info">Now loading...</span>',
  noneHTML: '<div class="alert alert-warning">There are no items.</div>'
});

$('#sample3').textassist({
  find: function(term, callback) {
    console.log('term = ' + term);
    callback(filterData(term));
  },
  beforeFix: function(source) {
    console.log('beforeFix: ' + source);
    return source;
  },
  afterFix: function(value) {
    console.log('afterFix: ' + value);
  }
});