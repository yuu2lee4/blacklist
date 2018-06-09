"use strict";

var dappAddress = "n1hTJCbji5vnF3tepukjFKBpWFM9wFd2J8k";
var hash = "2bf93d93553afb7410a95617c74628cd58e2d5fb8ef550441da69b1508c8ab49";
var NebPay = require("nebpay");
var nebPay = new NebPay();

/*** 导航切换 ***/
$('#nav-input').on('click', function () {
  $('#nav-input').addClass('active');
  $('#nav-search').removeClass('active');
  $('#add').show();
  $('#search').hide();
})

$('#nav-search').on('click', function () {
  $('#nav-search').addClass('active');
  $('#nav-input').removeClass('active');
  $('#add').hide();
  $('#search').show();
})
/*** 生成地区  ***/

function generateDistrict() {
  const dists = ['北京', '上海', '重庆', '天津', '河北', '山西','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','海南','四川','贵州','云南','陕西','甘肃','青海','广西','内蒙古','西藏','宁夏','新疆','香港','澳门','台湾'];

  let str = '<option value="">---请选择地区---</option>';
  for (const dist of dists) {
    str += `<option value="${dist}">${dist}</option>`;
  }
  $('#inp-district').html(str);
  $('#sel-district').html(str);
}
generateDistrict();

/*** toast封装 ***/
function toast (text) {
  $('#toast').html(text);
  $('#toast').show();
  setTimeout(function () {
    $('#toast').addClass('toast-show');
    showToast()
  }, 300);
}

function showToast () {
  setTimeout(function () {
    $('#toast').removeClass('toast-show');
    setTimeout(function () {
      $('#toast').hide();
    }, 2300);
  }, 3000);
}

/*** tloading封装 ***/
function loading (type) {
  if (type) {
    $('#loading').show();
  } else {
    $('#loading').hide();
  }
}
function validate(rules) {
  let pass = true;
  for (const rule of rules) {
    if (!$(rule.el).val()) {
      pass = false;
      toast(rule.msg);
      break;
    }
  }
  return pass;
}

/*** 添加信息逻辑 ***/
$('#add-submit').on('click', function () {
  const pass = validate([{
    el: '#inp-district',
    msg: '请选择地区'
  }, {
    el: '#inp-name',
    msg: '请填写公司名称'
  }, {
    el: '#inp-content',
    msg: '请填写内容'
  }])
  if (!pass) return;

  loading(true);
  setInformation($('#inp-district').val(), $('#inp-name').val(), $('#inp-content').val())
})

/*** 添加信息和智能合约交互 ***/
function setInformation (district, name, content) {
  nebPay.call(dappAddress, "0", "set", JSON.stringify([district, {name, content}]), { 
    listener: function(res){
      loading(false);
      if (res.txhash) {
        toast('信息添加成功,1分钟后可查询信息')
      }
    }
  })
}

/*** 查询信息逻辑 ***/
$('#search-input').on('click', function () {
  if (!$('#sel-district').val()) {
    return toast('请选择地区');
  }
  loading(true);
  getInformation($('#sel-district').val());
})

/*** 查询信息和智能合约交互 ***/
function getInformation (district) {
  nebPay.simulateCall(dappAddress, "0", "get", JSON.stringify([district]), {
    listener: function(res) {
      loading(false);
      if(res.result == '' && res.execute_err == 'contract check failed') {
          toast('合约检测失败，请检查浏览器钱包插件环境！');
          return;
      }

      var datalist = JSON.parse(res.result);
      renderSearch(datalist)
    }
  })
}

/*** 渲染查询出来的逻辑 ***/
function renderSearch (data) {
  var html = '';
  var datalist = JSON.parse(data);
  if (datalist && datalist.length) {
    for (var i = 0; i < datalist.length; i++) {
      html += '<div class="search-result-item">'
          +'<div class="search-result-name">' + datalist[i].value.name + '</div>'
          +'<div class="search-result-content">' + datalist[i].value.content + '</div>'
        +'</div>'
    }
  } else {
    html += '<div class="search-result-item">该地区暂无信息</div>'
  }
  $('#search-result').html(html);
}
