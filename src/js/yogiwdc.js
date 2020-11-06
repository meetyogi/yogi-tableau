(function () {
  // Create the connector object
  var myConnector = tableau.makeConnector();
  // Define the schema
  myConnector.getSchema = function (schemaCallback) {
    //Get the json response
    var url = "https://api.meetyogi.com/post/feed";
    var request = $.ajax({
      url: url,
      type: "GET",
      data: { connector: "tableau" },
      contentType: "application/json; charset=utf-8",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", tableau.connectionData);
      },
    });

    request.done(function (data) {
      //Create Post Columns
      var post_keys = Object.keys(data.post_meta);
      var post_columns = [];
      for (var i = 0; i < post_keys.length; i++) {
        var type = "";
        if (
          data.post_meta[post_keys[i]].type == "str" ||
          data.post_meta[post_keys[i]].type == "mixed"
        ) {
          type = "string";
        } else if (data.post_meta[post_keys[i]].type == "date") {
          type = "date";
        } else if (data.post_meta[post_keys[i]].type == "float") {
          type = "float";
        } else if (data.post_meta[post_keys[i]].type == "int") {
          type = "int";
        } else {
          type = "string";
        }

        var alias = data.post_meta[post_keys[i]].alias;
        post_keys[i] = post_keys[i].replace(/ /g, "_");
        post_keys[i] = post_keys[i].replace(/-/g, "_");

        post_columns[i] = {
          id: post_keys[i],
          alias: alias,
          dataType: tableau.dataTypeEnum[type],
        };
      }
      console.log("made it to post schema");
      var tableSchemaPost = {
        id: "yogi_posts",
        alias: "Yogi Posts",
        columns: post_columns,
      };

      //Create Themes Columns
      var theme_keys = Object.keys(data.theme_meta);
      var theme_columns = [];
      for (var i = 0; i < theme_keys.length; i++) {
        var type = "";
        if (
          data.theme_meta[theme_keys[i]].type == "str" ||
          data.theme_meta[theme_keys[i]].type == "mixed"
        ) {
          type = "string";
        } else if (data.theme_meta[theme_keys[i]].type == "date") {
          type = "date";
        } else if (data.theme_meta[theme_keys[i]].type == "float") {
          type = "float";
        } else if (data.theme_meta[theme_keys[i]].type == "int") {
          type = "int";
        } else {
          type = "string";
        }
        var alias = data.theme_meta[theme_keys[i]].alias;
        theme_keys[i] = theme_keys[i].replace(/ /g, "_");
        theme_keys[i] = theme_keys[i].replace(/-/g, "_");

        theme_columns[i] = {
          id: theme_keys[i],
          alias: alias,
          dataType: tableau.dataTypeEnum[type],
        };
      }
      console.log("made it to theme schema");

      var tableSchemaTheme = {
        id: "yogi_themes",
        alias: "Yogi Themes",
        columns: theme_columns,
      };

      //Create Left Join for Posts and Themes
      console.log("made it to data join");
      var standardConnection = {
        alias: "Joined Yogi Posts and Themes data",
        tables: [
          {
            id: "yogi_posts",
            alias: "Yogi Posts",
          },
          {
            id: "yogi_themes",
            alias: "Yogi Themes",
          },
        ],
        joins: [
          {
            left: {
              tableAlias: "Yogi Posts",
              columnId: "post_uuid",
            },
            right: {
              tableAlias: "Yogi Themes",
              columnId: "post_uuid",
            },
            joinType: "left",
          },
        ],
      };

      schemaCallback([tableSchemaPost, tableSchemaTheme], [standardConnection]);
    });
    //JSON response failure
    request.fail(function (data) {
      alert(
        "Failure, Please re-enter the Project Token or reach out to Yogi Support"
      );
    });
  };

  // Download the data
  myConnector.getData = function (table, doneCallback) {
    var url = "https://api.meetyogi.com/post/feed";
    //Get the json response
    var request = $.ajax({
      url: url,
      type: "GET",
      data: { connector: "tableau" },
      contentType: "application/json; charset=utf-8",
      beforeSend: function (request) {
        request.setRequestHeader("Authorization", tableau.connectionData);
      },
    });
    request.done(function (data) {
      var tableData = [];
      var post_keys = Object.keys(data.posts[0]);
      var theme_keys = Object.keys(data.themes[0]);
      var post_length = data.posts.length;
      var theme_length = data.themes.length;

      //rename keys from data to match schema formatting
      var post_keys_renamed = post_keys.map((key) => {
        key = key.replace(/ /g, "_");
        return key.replace(/-/g, "_");
      });
      var theme_keys_renamed = theme_keys.map((key) => {
        key = key.replace(/ /g, "_");
        return key.replace(/-/g, "_");
      });

      if (table.tableInfo.id == "yogi_posts") {
        for (var i = 0; i < post_length; i++) {
          var post_row = data.posts[i];
          var tableRow = {};

          for (var j = 0; j < post_keys.length; j++) {
            //renamed key (which should match schema) is given its correspoding value
            tableRow[post_keys_renamed[j]] = post_row[post_keys[j]];
          }
          tableData.push(tableRow);
        }
      } else if (table.tableInfo.id == "yogi_themes") {
        for (var i = 0; i < theme_length; i++) {
          var theme_row = data.themes[i];
          var tableRow = {};

          for (var j = 0; j < theme_keys.length; j++) {
            //renamed key is given its corresponding value
            tableRow[theme_keys_renamed[j]] = theme_row[theme_keys[j]];
          }
          tableData.push(tableRow);
        }
      }

      //Append table rows in size of 1000 at a time to avoid overwhelming pipeline
      var row_index = 0;
      var size = 1000;
      while (row_index < tableData.length) {
        table.appendRows(tableData.slice(row_index, size + row_index));
        tableau.reportProgress(
          "Got " + table.tableInfo.id + " row: " + row_index
        );
        row_index += size;
      }
      doneCallback();
    });

    request.fail(function (data) {
      alert(
        "Failure, Please re-enter the Project Token or reach out to Yogi Support"
      );
    });
  };

  tableau.registerConnector(myConnector);

  // Create event listeners for when the user submits the form
  $(document).ready(function () {
    $("#submitButton").click(function () {
      tableau.connectionName = "Yogi Connector";
      var key = $("#key").val();
      tableau.connectionData = key;
      tableau.submit();
    });
  });
})();
