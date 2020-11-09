# Yogi's Tableau Web Data Connector


## Resources

[WDC Homepage](https://tableau.github.io/webdataconnector/) 

[WDC SDK installation](https://tableau.github.io/webdataconnector/docs/#get-the-wdc-sdk)

[WDC SDK tutorial](https://tableau.github.io/webdataconnector/docs/wdc_tutorial.html)



## Summary

There are two primary functions in a WDC 
```
myConnector.getSchema = function (schemaCallback) {};

myConnector.getData = function (table, doneCallback) {};
```

getSchema makes an AJAX call to our API and sanitizes the response JSON to generate post and theme tables for Tableau using post_meta and theme_meta. It also joins the two tables together using a left join between post and theme.

getData makes a call to our API and populates the tables generated from getSchema.