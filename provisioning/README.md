This panel requires connection to an ERDDAP server that allows CORS requests.
For an example ERDDAP configuration see [USF-IMARS/erddap-config](https://github.com/USF-IMARS/erddap-config/).
An example of the required CORS setting is [here](https://github.com/USF-IMARS/erddap-config/blob/44ca9cb54d8e65b8068ddcf2994642ebad0fe2f7/web.xml#L39-L42).

Many ERDDAP servers are available with public data, but most will not allow CORS.
In this case you can run your own simple ERDDAP server and pass through to another ERDDAP server [like this](https://github.com/USF-IMARS/erddap-config/blob/44ca9cb54d8e65b8068ddcf2994642ebad0fe2f7/datasets.xml#L691-L693).

Documentation for running an ERDDAP server:
* [official ERDDAP documentation pages](https://coastwatch.pfeg.noaa.gov/erddap/information.html)
* [example ERDDAP config using docker](https://github.com/USF-IMARS/erddap-config/)
* [ERDDAP Docker image documentation](https://github.com/axiom-data-science/docker-erddap)
