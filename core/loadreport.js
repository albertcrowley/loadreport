#!/usr/bin/env phantomjs

var fs = require('fs'),
    WebPage = require('webpage');

var loadreport = {

  run: function () {
    var cliConfig = {};
    loadreport.performancecache = this.clone(loadreport.performance_old);
    if (!this.processArgs(cliConfig, [
      {
        name: 'url',
        def: 'http://google.com',
        req: true,
        desc: 'the URL of the site to load test'
      },
      {
        name: 'task',
        def: 'performance_old',
        req: false,
        desc: 'the task to perform',
        oneof: ['performance', 'navigation','performance_old', 'performancecache', 'filmstrip']
      },
      {
        name: 'configFile',
        def: 'config.json',
        req: false,
        desc: 'a local configuration file of further loadreport settings'
      }
    ])) {
      return;
    }
    this.config = this.mergeConfig(cliConfig, cliConfig.configFile);
    var task = this[this.config.task];
    this.load(this.config, task, this);
  },





  performance: {

    perfObj:{

      data : function(){

        var report  = {};

        //returnd HRT - High Resolution Time gives us floating point time stamps that can be accurate to microsecond resolution.
        //The now() method returns the time elapsed from when the navigationStart time in PerformanceTiming happened.

        //high level load times
        report.pageLoadTime = {label: 'Total time to load page',value: 0};

        report.perceivedLoadTime = {label: 'User-perceived page load time', value: 0};

        //time spent making request to server and receiving the response - after network lookups and nego
        report.requestResponse = {label: 'Calculate time from request start to response end',value: 0};

        //network level redirects
        report.redirectTime = {label:'Time spent during redirect',value: 0};

        //time spent in app cache, domain lookups, and making secure connection
        report.fetchTime = {label:'Fetch start to response end', value: 0};

        //time spent processing page
        report.pageProcessTime = {label: 'Total time spent processing page',value: 0};

        return JSON.stringify(report);


      }

    },

    onInitialized: function (page, config) {

      var pageeval = page.evaluate(function (perfObj) {

        var report = JSON.parse(perfObj),
            now = new Date().getTime(),
            timing =  performance.timing;

        console.log(performance.now(),now);

        report.pageLoadTime.value = timing.loadEventEnd - timing.navigationStart;
        report.perceivedLoadTime.value = 0; //TODO - calculate if needed
        report.requestResponse.value = timing.responseEnd - timing.requestStart;
        report.redirectTime.value = timing.redirectEnd - timing.redirectStart;
        report.fetchTime.value = timing.connectEnd - timing.fetchStart;
        report.pageProcessTime.value = timing.loadEventStart - timing.domLoading;

        for(var key in report){

          console.log('----',report[key].label,report[key].value)

        }

      }, this.performance.perfObj.data());

    },
    onLoadStarted: function (page, config) {
        console.log('###################',this.performance.start)
//      if (!this.performance_old.start) {
//        this.performance_old.start = new Date().getTime();
//      }
    },

    onLoadFinished: function() {








      console.log('connectStart',timing.connectStart);

      console.log('navigationStart',timing.navigationStart);

      console.log('secureConnectionStart',timing.secureConnectionStart);

      console.log('fetchStart',timing.fetchStart);

      console.log('domContentLoadedEventStart',timing.domContentLoadedEventStart);

      console.log('responseStart',timing.responseStart);

      console.log('domInteractive',timing.domInteractive);

      console.log('domainLookupEnd',timing.domainLookupEnd);

      console.log('redirectStart',timing.redirectStart);

      console.log('requestStart',timing.requestStart);

      console.log('unloadEventEnd',timing.unloadEventEnd);

      console.log('unloadEventStart',timing.unloadEventStart);

      console.log('domComplete',timing.domComplete);

      console.log('domainLookupStart',timing.domainLookupStart);

      console.log('loadEventStart',timing.loadEventStart);

      console.log('domContentLoadedEventEnd',timing.domContentLoadedEventEnd);

      console.log('redirectEnd', timing.redirectEnd);

      console.log('connectEnd',timing.connectEnd);

      console.log('responseEnd', timing.responseEnd);

      console.log('domLoading',timing.domLoading);

      console.log('loadEventEnd',timing.loadEventEnd);

    }
  },

  navigation: {
    onInitialized: function(){
      var nav = performance.navigation;

      console.log('Navigation Timing Description');

        switch(nav.type){
          case 0:
            console.log('Type_NavigateNext: Navigation started by clicking on a link, or entering the URL in the user agent\'s address bar, or form submission, or initializing through a script operation');
            break;
          case 1:
            console.log('Type_Reload: Navigation through the reload operation or the location.reload() method.');
            break;
          case 2:
            console.log('Type_Back_Forward: Navigation through a history traversal operation.');
            break;
          case 255:
            console.log('Type_Undefined: Any navigation types not defined by values above.');
            break;
          default:
            console.log('Not detected');
        }
      }
  },



  performance_old: {
    resources: [],
    count1: 100,
    count2: 1,
    timer: 0,
    evalConsole: {},
    evalConsoleErrors: [],
    onInitialized: function (page, config) {
      var pageeval = page.evaluate(function (startTime) {
        var now = new Date().getTime();
        //check the readystate within the page being loaded

        //Returns "loading" while the document is loading
        var _timer3 = setInterval(function () {
          if (/loading/.test(document.readyState)) {
            console.log('loading-' + (new Date().getTime() - startTime));
            //don't clear the interval until we get last measurement
          }
        }, 5);

        // "interactive" once it is finished parsing but still loading sub-resources
        var _timer1 = setInterval(function () {
          if (/interactive/.test(document.readyState)) {
            console.log('interactive-' + (new Date().getTime() - startTime));
            clearInterval(_timer1);
            //clear loading interval
            clearInterval(_timer3);
          }
        }, 5);

        //"complete" once it has loaded - same as load event below
        // var _timer2=setInterval(function(){
        //     if(/complete/.test(document.readyState)){
        //         console.log('complete-' + (new Date().getTime() - startTime));
        //         clearInterval(_timer2);
        //     }
        // }, 5);

        //The DOMContentLoaded event is fired when the document has been completely
        //loaded and parsed, without waiting for stylesheets, images, and subframes
        //to finish loading
        document.addEventListener("DOMContentLoaded", function () {
          console.log('DOMContentLoaded-' + (new Date().getTime() - startTime));
        }, false);

        //detect a fully-loaded page
        window.addEventListener("load", function () {
          console.log('onload-' + (new Date().getTime() - startTime));
        }, false);

        //check for JS errors
        window.onerror = function (message, url, linenumber) {
          console.log("jserror-JavaScript error: " + message + " on line " + linenumber + " for " + url);
        };
      }, this.performance_old.start);
    },
    onLoadStarted: function (page, config) {
      if (!this.performance_old.start) {
        this.performance_old.start = new Date().getTime();
      }
    },
    onResourceRequested: function (page, config, request) {
      var now = new Date().getTime();
      this.performance_old.resources[request.id] = {
        id: request.id,
        url: request.url,
        request: request,
        responses: {},
        duration: '',
        times: {
          request: now
        }
      };
      if (!this.performance_old.start || now < this.performance_old.start) {
        this.performance_old.start = now;
      }

    },
    onResourceReceived: function (page, config, response) {
      var now = new Date().getTime(),
          resource = this.performance_old.resources[response.id];
      resource.responses[response.stage] = response;
      if (!resource.times[response.stage]) {
        resource.times[response.stage] = now;
        resource.duration = now - resource.times.request;
      }
      if (response.bodySize) {
        resource.size = response.bodySize;
        response.headers.forEach(function (header) {
        });
      } else if (!resource.size) {
        response.headers.forEach(function (header) {
          if (header.name.toLowerCase() == 'content-length' && header.value != 0) {
            //console.log('backup-------' + header.name + ':' + header.value);
            resource.size = parseInt(header.value);
          }
        });
      }
    },
    onLoadFinished: function (page, config, status) {
      var start = this.performance_old.start,
          finish = new Date().getTime(),
          resources = this.performance_old.resources,
          slowest, fastest, totalDuration = 0,
          largest, smallest, totalSize = 0,
          missingList = [],
          missingSize = false,
          elapsed = finish - start,
          now = new Date();

      resources.forEach(function (resource) {
        if (!resource.times.start) {
          resource.times.start = resource.times.end;
        }
        if (!slowest || resource.duration > slowest.duration) {
          slowest = resource;
        }
        if (!fastest || resource.duration < fastest.duration) {
          fastest = resource;
        }
        //console.log(totalDuration);
        totalDuration += resource.duration;

        if (resource.size) {
          if (!largest || resource.size > largest.size) {
            largest = resource;
          }
          if (!smallest || resource.size < smallest.size) {
            smallest = resource;
          }
          totalSize += resource.size;
        } else {
          resource.size = 0;
          missingSize = true;
          missingList.push(resource.url);
        }
      });

      if (config.verbose) {
        console.log('');
        this.emitConfig(config, '');
      }

      var report = {};
      report.url = phantom.args[0];
      report.phantomCacheEnabled = phantom.args.indexOf('yes') >= 0 ? 'yes' : 'no';
      report.taskName = config.task;
      var drsi = parseInt(this.performance_old.evalConsole.interactive);
      var drsl = parseInt(this.performance_old.evalConsole.loading);
      var wo = parseInt(this.performance_old.evalConsole.onload);
      // var drsc = parseInt(this.performance_old.evalConsole.complete);

      report.domReadystateLoading = isNaN(drsl) == false ? drsl : 0;
      report.domReadystateInteractive = isNaN(drsi) == false ? drsi : 0;
      // report.domReadystateComplete = isNaN(drsc) == false ? drsc : 0;
      report.windowOnload = isNaN(wo) == false ? wo : 0;

      report.elapsedLoadTime = elapsed;
      report.numberOfResources = resources.length - 1;
      report.totalResourcesTime = totalDuration;
      report.slowestResource = slowest.url;
      report.largestResource = largest.url;
      report.totalResourcesSize = (totalSize / 1000);
      report.nonReportingResources = missingList.length;
      report.timeStamp = now.getTime();
      report.date = now.getDate() + "/" + now.getMonth() + "/" + now.getFullYear();
      report.time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
      report.errors = this.performance_old.evalConsoleErrors;


      //console.log(JSON.stringify(report));
      console.log('Elapsed load time: ' + this.pad(elapsed, 6) + 'ms');

      if (phantom.args.indexOf('csv') >= 0) {
        this.printToFile(config, report, 'loadreport', 'csv', phantom.args.indexOf('wipe') >= 0);
      }

      if (phantom.args.indexOf('json') >= 0) {
        this.printToFile(config, report, 'loadreport', 'json', phantom.args.indexOf('wipe') >= 0);
      }

      if (phantom.args.indexOf('junit') >= 0) {
        this.printToFile(config, report, 'loadreport', 'xml', phantom.args.indexOf('wipe') >= 0);
      }

    }


  },

  filmstrip: {
    onInitialized: function (page, config) {
      this.screenshot(new Date().getTime(), page);
    },
    onLoadStarted: function (page, config) {
      if (!this.performance_old.start) {
        this.performance_old.start = new Date().getTime();
      }
      this.screenshot(new Date().getTime(), page);
    },
    onResourceRequested: function (page, config, request) {
      this.screenshot(new Date().getTime(), page);
    },
    onResourceReceived: function (page, config, response) {
      this.screenshot(new Date().getTime(), page);
    },

    onLoadFinished: function (page, config, status) {
      this.screenshot(new Date().getTime(), page);
    }
  },

  getFinalUrl: function (page) {
    return page.evaluate(function () {
      return document.location.toString();
    });
  },

  emitConfig: function (config, prefix) {
    console.log(prefix + 'Config:');
    for (key in config) {
      if (config[key].constructor === Object) {
        if (key === config.task) {
          console.log(prefix + ' ' + key + ':');
          for (key2 in config[key]) {
            console.log(prefix + '  ' + key2 + ': ' + config[key][key2]);
          }
        }
      } else {
        console.log(prefix + ' ' + key + ': ' + config[key]);
      }
    }
  },

  load: function (config, task, scope) {
    var page = WebPage.create(),
        pagetemp = WebPage.create(),
        event;

    if (config.userAgent && config.userAgent != "default") {
      if (config.userAgentAliases[config.userAgent]) {
        config.userAgent = config.userAgentAliases[config.userAgent];
      }
      page.settings.userAgent = config.userAgent;
    }
    ['onInitialized', 'onLoadStarted', 'onLoadFinished','onResourceRequested', 'onResourceReceived']
        .forEach(function (event) {
          if (task[event]) {
            page[event] = function () {
              var args = [page, config],
                  a, aL;
              for (a = 0, aL = arguments.length; a < aL; a++) {
                args.push(arguments[a]);
              }
              task[event].apply(scope, args);
            };

          }
        });
    if (task.onLoadFinished) {
      page.onLoadFinished = function (status) {
        if (config.wait) {
          setTimeout(
              function () {
                task.onLoadFinished.call(scope, page, config, status);
              },
              config.wait
          );
        } else {
          task.onLoadFinished.call(scope, page, config, status);
        }
        phantom.exit();

        page = WebPage.create();
        doPageLoad();
      };
    } else {
      page.onLoadFinished = function (status) {
        phantom.exit();
      };
    }
    page.settings.localToRemoteUrlAccessEnabled = true;
    page.settings.webSecurityEnabled = false;
    page.onConsoleMessage = function (msg) {
      console.log('eval\'d',msg)
      if (msg.indexOf('jserror-') >= 0) {
        loadreport.performance_old.evalConsoleErrors.push(msg.substring('jserror-'.length, msg.length));
      } else {
        if (msg.indexOf('loading-') >= 0) {
          loadreport.performance_old.evalConsole.loading = msg.substring('loading-'.length, msg.length);
        } else if (msg.indexOf('interactive-') >= 0) {
          loadreport.performance_old.evalConsole.interactive = msg.substring('interactive-'.length, msg.length);
          // } else if (msg.indexOf('complete-') >= 0){
          //     loadreport.performance_old.evalConsole.complete = msg.substring('complete-'.length,msg.length);
        } else if (msg.indexOf('onload-') >= 0) {
          loadreport.performance_old.evalConsole.onload = msg.substring('onload-'.length, msg.length);
        }
        //loadreport.performance_old.evalConsole.push(msg);
      }
    };

    page.onError = function (msg, trace) {
      //console.log("+++++  " + msg);
      trace.forEach(function (item) {
        loadreport.performance_old.evalConsoleErrors.push(msg + ':' + item.file + ':' + item.line);
      })
    };

    function doPageLoad() {
      setTimeout(function () {
        page.open(config.url);
      }, config.cacheWait);
    }

    if (config.task == 'performancecache') {

      pagetemp.open(config.url, function (status) {
        if (status === 'success') {
          pagetemp.release();
          doPageLoad();
        }
      });
    } else {
      doPageLoad();
    }
  },

  processArgs: function (config, contract) {
    var a = 0;
    var ok = true;

    contract.forEach(function (argument) {
      if (a < phantom.args.length) {
        config[argument.name] = phantom.args[a];
      } else {
        if (argument.req) {
          console.log('"' + argument.name + '" argument is required. This ' + argument.desc + '.');
          ok = false;
        } else {
          config[argument.name] = argument.def;
        }
      }
      if (argument.oneof && argument.oneof.indexOf(config[argument.name]) == -1) {
        console.log('"' + argument.name + '" argument must be one of: ' + argument.oneof.join(', '));
        ok = false;
      }
      a++;
    });
    return ok;
  },

  mergeConfig: function (config, configFile) {
    var result = '', key;
    if (fs.exists(configFile)) {
      configFile = "config.json";
      result = JSON.parse(fs.read(configFile));
    } else {
      //need to hard code default config file if installed as global module... better way? we don't need a lot of this.
      result = {
        "task": "performance_old",
        "userAgent": "chrome",
        "userAgentAliases": {
          "iphone": "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_0 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8A293 Safari/6531.22.7",
          "android": "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
          "chrome": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.11 (KHTML, like Gecko) Chrome/17.0.963.12 Safari/535.11"
        },
        "wait": 0,
        "cacheWait": 200,
        "consolePrefix": "#",
        "verbose": false
      }
    }
    for (key in config) {
      result[key] = config[key];
    }

    return result;
  },

  truncate: function (str, length) {
    length = length || 80;
    if (str.length <= length) {
      return str;
    }
    var half = length / 2;
    return str.substr(0, half - 2) + '...' + str.substr(str.length - half + 1);
  },

  pad: function (str, length) {
    var padded = str.toString();
    if (padded.length > length) {
      return this.pad(padded, length * 2);
    }
    return this.repeat(' ', length - padded.length) + padded;
  },

  repeat: function (chr, length) {
    for (var str = '', l = 0; l < length; l++) {
      str += chr;
    }
    return str;
  },

  clone: function (obj) {
    var target = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        target[i] = obj[i];
      }
    }
    return target;
  },

  timerStart: function () {
    return (new Date()).getTime();
  },

  timerEnd: function (start) {
    return ((new Date()).getTime() - start);
  },

  /*worker: function(now,page){
   var currentTime = now - this.performance_old.start;
   var ths = this;


   if((currentTime) >= this.performance_old.count1){
   var worker = new Worker('file:///Users/wesleyhales/phantom-test/worker.js');
   worker.addEventListener('message', function (event) {
   //getting errors after 3rd thread with...
   //_this.workerTask.callback(event);
   //mycallback(event);
   console.log('message' + event.data);
   }, false);
   worker.postMessage(page);
   this.performance_old.count2++;
   this.performance_old.count1 = currentTime + (this.performance_old.count2 * 100);
   }
   },*/

  screenshot: function (now, page) {
    var start = this.timerStart();
    var currentTime = now - this.performance_old.start;
    var ths = this;
    if ((currentTime) >= this.performance_old.count1) {
      //var ashot = page.renderBase64();
      page.render('filmstrip/screenshot' + this.performance_old.timer + '.png');
      this.performance_old.count2++;
      this.performance_old.count1 = currentTime + (this.performance_old.count2 * 100);
      //subtract the time it took to render this image
      this.performance_old.timer = this.timerEnd(start) - this.performance_old.count1;
    }
  },

  /**
   * Format test results as JUnit XML for CI
   * @see: http://www.junit.org/
   * @param {Array} tests the arrays containing the test results from testResults.
   * @return {String} the results as JUnit XML text
   */
  formatAsJUnit: function (keys, values) {
    var junitable = ['domReadystateLoading', 'domReadystateInteractive', 'windowOnload', 'elapsedLoadTime', 'numberOfResources', 'totalResourcesTime', 'totalResourcesSize', 'nonReportingResources'];
    var i, n = 0, key, value, suite,
        junit = [],
        suites = [];

    for (i = 0; i < keys.length; i++) {
      key = keys[i];

      if (junitable.indexOf(key) === -1) {
        continue;
      }
      value = values[i];
      // open test suite w/ summary
      suite = '  <testsuite name="' + key + '" tests="1">\n';
      suite += '    <testcase name="' + key + '" time="' + value + '"/>\n';
      suite += '  </testsuite>';
      suites.push(suite);
      n++;
    }

    // xml
    junit.push('<?xml version="1.0" encoding="UTF-8" ?>');

    // open test suites wrapper
    junit.push('<testsuites>');

    // concat test cases
    junit = junit.concat(suites);

    // close test suites wrapper
    junit.push('</testsuites>');

    return junit.join('\n');
  },

  printToFile: function (config, report, filename, extension, createNew) {
    var f, myfile,
        keys = [], values = [];
    for (var key in report) {
      if (report.hasOwnProperty(key)) {
        keys.push(key);
        values.push(report[key]);
      }
    }
    if (phantom.args[3] && phantom.args[3] != 'wipe') {
      myfile = 'reports/' + filename + '-' + phantom.args[3] + '.' + extension;
    } else {
      myfile = 'reports/' + filename + '.' + extension;
    }
    // Given localhost:8880/some
    // Transforms to localhost_8880/some
    myfile = myfile.replace(":", "_");

    if (!createNew && fs.exists(myfile)) {
      //file exists so append line
      try {
        switch (extension) {
          case 'json':
            var phantomLog = [];
            var tempLine = null;
            var json_content = fs.read(myfile);
            if (json_content != "") {
              tempLine = JSON.parse(json_content);
            }
            if (Object.prototype.toString.call(tempLine) === '[object Array]') {
              phantomLog = tempLine;
            }
            phantomLog.push(report);
            fs.remove(myfile);
            f = fs.open(myfile, "w");
            f.writeLine(JSON.stringify(phantomLog));
            f.close();
            break;
          case 'xml':
            console.log("cannot append report to xml file");
            break;
          default:
            f = fs.open(myfile, "a");
            f.writeLine(values);
            f.close();
            break;
        }
      } catch (e) {
        console.log("problem appending to file", e);
      }
    } else {
      if (fs.exists(myfile)) {
        fs.remove(myfile);
      }
      //write the headers and first line
      try {
        f = fs.open(myfile, "w");
        switch (extension) {
          case 'json':
            f.writeLine(JSON.stringify(report));
            break;
          case 'xml':
            f.writeLine(this.formatAsJUnit(keys, values));
            break;
          default:
            f.writeLine(keys);
            f.writeLine(values);
            break;
        }
        f.close();
      } catch (e) {
        console.log("problem writing to file", e);
      }
    }
  }

};

loadreport.run();