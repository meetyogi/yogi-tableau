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
      var post_columns = [
        {
          id: "post_uuid",
          alias: "posts",
          dataType: tableau.dataTypeEnum.string,
        },
      ];

      console.log("made it to post schema");

      var tableSchemaPost = {
        id: "yogi_posts",
        alias: "Yogi Posts",
        columns: post_columns,
      };
      schemaCallback([tableSchemaPost]);
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
      var post_length = data.posts.length;

      console.log("made it to data population");

      if (table.tableInfo.id == "yogi_posts") {
        console.log("made it to post table data population");
        for (var i = 0; i < post_length; i++) {
          var post_row = data.posts[i];
          var tableRow = {};
          tableRow["post_uuid"] = post_row[post_keys[0]];

          tableData.push(tableRow);
        }
      }

      table.appendRows(tableData);
      tableau.reportProgress(
        `Got ${table.tableInfo.id} rows: ${tableData.length} `
      );
      console.log(table.tableInfo);
      console.log("finished populating the table");
    });

    request.fail(function (data) {
      alert(
        "Failure, Please re-enter the Project Token or reach out to Yogi Support"
      );
    });
    doneCallback();
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
