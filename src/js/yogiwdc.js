(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();
    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
      var url = "https://api-dev.meetyogi.com/post/feed" //change to api
      var request = $.ajax({
          url: url,
          type: "GET",
          data: {connector: "tableau"} ,
          contentType:'application/json; charset=utf-8',
          beforeSend: function(request) {
              request.setRequestHeader("Authorization", tableau.connectionData);
          }
      })

      request.done(function(data) {
          var keys = Object.keys(data.post_meta)
          var cols = []
          for(var i = 0; i < keys.length; i++) {
            var type = ""
            if(data.post_meta[keys[i]].type == "str" || data.post_meta[keys[i]].type == "mixed") {
              type = "string"
            }
            else if(data.post_meta[keys[i]].type == "date") {
              type = "date"
            }
            else if(data.post_meta[keys[i]].type == "float") {
              type = "float"
            }
            else if(data.post_meta[keys[i]].type == "int") {
              type = "int"
            }
            else {
              type = "string"
            }

            var alias = data.post_meta[keys[i]].alias
            keys[i] = keys[i].replaceAll(' ', '_') //replace all

            cols[i] = {
              id: keys[i],
              alias: alias,
              dataType: tableau.dataTypeEnum[type]
            }
          }
          var tableSchema = {
              id: "yogi_posts",
              alias: "Yogi Posts",
              columns: cols
          };

          var keys1 = Object.keys(data.theme_meta)
          var cols1 = []
          for(var i = 0; i < keys1.length; i++) {
            var type = ""
            if(data.theme_meta[keys1[i]].type == "str" || data.theme_meta[keys1[i]].type == "mixed") {
              type = "string"
            }
            else if(data.theme_meta[keys1[i]].type == "date") {
              type = "date"
            }
            else if(data.theme_meta[keys1[i]].type == "float") {
              type = "float"
            }
            else if(data.theme_meta[keys1[i]].type == "int") {
              type = "int"
            }
            else {
              type = "string"
            }
            var alias = data.theme_meta[keys1[i]].alias
            keys1[i] = keys1[i].replaceAll(' ', '_')

            cols1[i] = {
              id: keys1[i],
              alias: alias,
              dataType: tableau.dataTypeEnum[type]
            }
          }
          var tableSchema1 = {
              id: "yogi_themes",
              alias: "Yogi Themes",
              columns: cols1
          };

          var standardConnection = {
            "alias": "Joined Yogi Posts and Themes data",
            "tables": [{
              "id": "yogi_posts",
              "alias": "Yogi Posts"
            }, {
              "id": "yogi_themes",
              "alias": "Yogi Themes"
            }],
            "joins": [{
              "left": {
                "tableAlias": "Yogi Posts",
                "columnId": "post_uuid"
              },
              "right": {
                "tableAlias": "Yogi Themes",
                "columnId": "post_uuid"
              },
            "joinType": "left"
            }]
          };

        schemaCallback([tableSchema, tableSchema1], [standardConnection]);
      });
      request.fail(function(data) {
          alert("Failure, Please re-enter the Project Token or reach out to Yogi Support")
      })
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
      var url = "https://api-dev.meetyogi.com/post/feed" //change to api
      var request = $.ajax({
          url: url,
          type: "GET",
          data: {connector: "tableau"} ,
          contentType:'application/json; charset=utf-8',
          beforeSend: function(request) {
              request.setRequestHeader("Authorization", tableau.connectionData);
          }
      })
      request.done(function(data) {
        tableRow = {}
        var keys = Object.keys(data.posts[0])
        var keys1 = Object.keys(data.themes[0])
        var length = data.posts.length
        var length1 = data.themes.length
        if(table.tableInfo.id == "yogi_posts") {
          for(var i = 0; i < 50; i++) { //change from # to data.posts.length
            var details = data.posts[i];
            for(var j = 0; j < keys.length; j++) {
              var key = keys[j].replaceAll(' ', '_')
              tableRow[key] = details[keys[j]]
            }
            tableData = []
            tableData.push(tableRow)
            table.appendRows(tableData);
            tableau.reportProgress("Getting row: " + (i+1)) //every 100 rows
          }
        }
        else if(table.tableInfo.id == "yogi_themes") {
          for(var l = 0; l < 15; l++) { //change from # to data.themes.length
            var details = data.themes[l]
            for(var k = 0; k < keys1.length; k++) {
              var key = keys1[k].replaceAll(' ', '_')
              tableRow[key] = details[keys1[k]]
            }
            tableData = []
            tableData.push(tableRow)
            table.appendRows(tableData);
            tableau.reportProgress("Getting row: " + (l+1)) //every 100 rows
          }
        }

      })

      request.fail(function(data) {
          alert("Failure, Please re-enter the Project Token or reach out to Yogi Support")
      })
      doneCallback();
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function() {
        $("#submitButton").click(function() {
            tableau.connectionName = "Yogi Connector"; // This will be the data source name in Tableau
            var key = $("#key").val();
            tableau.connectionData = key;
            tableau.submit(); // This sends the connector object to Tableau
        });
    });
})();
