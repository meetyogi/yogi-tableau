(function () {
    // Create the connector object
    let myConnector = tableau.makeConnector();
    // Define the schema
    myConnector.getSchema = function (schemaCallback) {
        //Get the json response
        const url = "https://api.meetyogi.com/post/feed";
        const request = $.ajax({
            url: url,
            type: "GET",
            data: {
                connector: "tableau",
                get_theme_sentiments: false,
                get_post_keywords: false,
                get_post_sentiment_info: false,
            },
            contentType: "application/json; charset=utf-8",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", tableau.connectionData);
            },
        });

        request.done(function (data) {
            //Create Post Columns
            const post_keys = Object.keys(data.post_meta);
            const post_columns = [];
            for (let i = 0; i < post_keys.length; i++) {
                let type = "";
                if (
                    data.post_meta[post_keys[i]].type === "str" ||
                    data.post_meta[post_keys[i]].type === "mixed"
                ) {
                    type = "string";
                } else if (data.post_meta[post_keys[i]].type === "date") {
                    type = "date";
                } else if (data.post_meta[post_keys[i]].type === "float") {
                    type = "float";
                } else if (data.post_meta[post_keys[i]].type === "int") {
                    type = "int";
                } else {
                    type = "string";
                }

                const alias = data.post_meta[post_keys[i]].alias;

                post_columns[i] = {
                    id: post_keys[i],
                    alias: alias,
                    dataType: tableau.dataTypeEnum[type],
                };
            }
            console.log("made it to post schema");
            const tableSchemaPost = {
                id: "yogi_ratings_reviews",
                alias: "Yogi Ratings & Reviews",
                columns: post_columns,
            };

            if (data.theme_meta) {
                //Create Themes Columns
                const theme_keys = Object.keys(data.theme_meta);
                let theme_columns = [];
                for (let i = 0; i < theme_keys.length; i++) {
                    let type = "";
                    if (
                        data.theme_meta[theme_keys[i]].type === "str" ||
                        data.theme_meta[theme_keys[i]].type === "mixed"
                    ) {
                        type = "string";
                    } else if (data.theme_meta[theme_keys[i]].type === "date") {
                        type = "date";
                    } else if (data.theme_meta[theme_keys[i]].type === "float") {
                        type = "float";
                    } else if (data.theme_meta[theme_keys[i]].type === "int") {
                        type = "int";
                    } else {
                        type = "string";
                    }
                    const alias = data.theme_meta[theme_keys[i]].alias;

                    theme_columns[i] = {
                        id: theme_keys[i],
                        alias: alias,
                        dataType: tableau.dataTypeEnum[type],
                    };
                }
                console.log("made it to theme schema");
                const tableSchemaTheme = {
                    id: "yogi_themes",
                    alias: "Yogi Themes",
                    columns: theme_columns,
                };

                //Create Left Join for Posts and Themes
                console.log("made it to data join");
                const standardConnection = {
                    alias: "Joined Yogi Ratings & Reviews and Themes data",
                    tables: [
                        {
                            id: "yogi_ratings_reviews",
                            alias: "Yogi Ratings & Reviews",
                        },
                        {
                            id: "yogi_themes",
                            alias: "Yogi Themes",
                        },
                    ],
                    joins: [
                        {
                            left: {
                                tableAlias: "Yogi Ratings & Reviews",
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
            } else {
                schemaCallback([tableSchemaPost], []);
            }
        });
        //JSON response failure
        request.fail(function (data) {
            try {
                let msg = JSON.parse(data.responseText).detail.msg
                alert(msg);
            } catch (e) {
                alert(
                    "Failure, Please re-enter the Project Token or reach out to Yogi Support"
                );
            }
            schemaCallback([], []);
        });
    };

    // Download the data
    myConnector.getData = function (table, doneCallback) {
        const url = "https://api.meetyogi.com/post/feed";
        //Get the json response
        const request = $.ajax({
            url: url,
            type: "GET",
            data: {
                connector: "tableau",
                get_theme_sentiments: false,
                get_post_keywords: false,
                get_post_sentiment_info: false,
            },
            contentType: "application/json; charset=utf-8",
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", tableau.connectionData);
            },
        });
        request.done(function (data) {
            console.log(data)
            let tableData = [];
            if (table.tableInfo.id === "yogi_ratings_reviews") {
                tableData = data.posts
            } else if (table.tableInfo.id === "yogi_themes") {
                tableData = data.themes
            } else {
                alert(
                    "Error during data processing. Please reach out to Yogi Support"
                );
                doneCallback();
            }
            // Append table rows in size of 1000 at a time to avoid overwhelming pipeline
            let row_index = 0;
            const size = 1000;
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
            try {
                let msg = JSON.parse(data.responseText).detail.msg
                alert(msg);
            } catch (e) {
                alert(
                    "Failure, Please re-enter the Project Token or reach out to Yogi Support"
                );
            }
            doneCallback();
        });
    };

    tableau.registerConnector(myConnector);

    // Create event listeners for when the user submits the form
    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "Yogi Connector";
            tableau.connectionData = $("#key").val();
            tableau.submit();
        });
    });
})();
