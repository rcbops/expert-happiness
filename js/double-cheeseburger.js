/*
 *    (c) Copyright 2016 Michael Rice <michael@michaelrice.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



$(document).ready(function () {
  'use strict';
  var info_site = "CHANGEME";

  fetchjsonMap(info_site);

  function helpInfoContainer() {
    var opened = false;
    var helpInfoControlBarBgColor = "#eee";
    var helpInfoControlBarFontColor = "#000";
    var helpInfoContainerBgColor = "#fff";
    var helpInfoContainerBorder = "1px solid rgba(0, 0, 0, 0.14)";
    var $help = $('<div></div>')
      .addClass('help-info-container')
      .css('border', helpInfoContainerBorder)
      .css('position', 'fixed')
      .css('bottom', '10px')
      .css('right', '10px')
      .css('background-color', helpInfoContainerBgColor)
      .css('width', '300px')
      .css('z-index', '3')
      .css("display", "block");

    var $control = $('<div>Help</div>')
      .addClass('help-info-control-bar')
      .css('background-color', helpInfoControlBarBgColor)
      .css('font-weight', 'bold')
      .css('padding', '5px 5px 5px 15px')
      .css('color', helpInfoControlBarFontColor)
      .css('cursor', 'pointer');

    var $icon = $('<span></span>')
      .addClass('glyphicon')
      .addClass('glyphicon-plus')
      .css('font-size', '17px')
      .css('float', 'right');
    $icon.appendTo($control);

    var $content = $('<div></div>')
      .addClass('help-info-content')
      .css('display', 'none')
      .css('overflow-y', 'auto')
      .css("margin", "10px 10px 10px 10px");

    $control.appendTo($help);
    $content.appendTo($help);

    function open() {
      var topBarHeight = $('.navbar').height();
      if (topBarHeight === 0) {
        topBarHeight = 40;
      }
      $help.css('top', "" + (topBarHeight + 10) + "px");
      $icon
        .addClass('glyphicon-minus')
        .removeClass('glyphicon-plus');
      var containerHeight = $help.height();
      var controlHeight = $control.height();
      $content
        .height(containerHeight - controlHeight - (3 * 10))
        .show();
      opened = true;
    }

    function close() {
      $help.css('top', '');
      $content.hide(); 
      $icon
        .addClass('glyphicon-plus')
        .removeClass('glyphicon-minus');
      opened = false;
    }

    $control.click(function(e) {
      if (opened)
        close();
      else
        open();
    });
    return $help;
  }

  function fetchjsonMap(site) {
    $.ajax({
      url: site.concat("/index.json"),
      type: "GET",
      dataType: "json",
      success: function(data) {
        findMatchingHelpDoc(data, site)
      },
      error: function() {
        fetchHelpError()
      }
    });
  }

  function findMatchingHelpDoc(data, site) {
    // Setup a regex using the data
    var doc_page_to_match = $(location).attr("pathname");
    // loop though the keys in the data file looking for a key that
    // matches the pathname
    var catalog = data["Catalog"];
    var arrayLen = catalog.length;
    var doc_to_serve;
    for(var i=0; i<arrayLen; i++) {
      var re = new RegExp(catalog[i]["regex"]);
      var matches = re.exec(doc_page_to_match);
      if(matches) {
        doc_to_serve = catalog[i]["doc"];
        break;
      }
      if(i === arrayLen-1) {
        fetchHelpError();
        return;
      }
    }
    fetchHelpPage(site.concat(doc_to_serve));
  }

  function fetchHelpPage(page) {
    $.ajax({
      url: page,
      type: "GET",
      dataType: "html",
      success: function(data) {
        fetchHelpPageSuccess(data)
      },
      error: function() {
        fetchHelpError()
      }
    });
  }

  function fetchHelpPageSuccess(data) {
    var $help = helpInfoContainer();
    $help.find('.help-info-content').html(data);
    $('#main_content').append($help);
  }

  function fetchHelpError() {
    $('#help-info-content').parent().empty().remove();
  }
});
