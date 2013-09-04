# Scraperrr.js

Command-line-based web crawler configured by JSON configurations, defining what data fields to scrape from the visited websites and how to export them as JSON.

This crawler was designed for motion portals in Pirate-Party wikis.
This examples given extract motions of a party assembly and exports them to JSON to be used on [pirat.ly](http://www.pirat.ly) and [Spickerrr](http://spickerrr.tumblr.com).


## Installation

    $ npm install scraperrr

## Quick Start

Several example configuration are provided in the `examples`-folder.

    $ scraperrr -c examples/gvtk131_config.json

This will export a JSON data file with the motions from the wiki.

## Options

	$ scraperrr -c examples/gvtk131_config.json -o out/gv-anträge.json

The resulting json export is saved in the defined output file.

    $ scraperrr -v -c examples/gvtk131_config.json

Verbose output for debugging. `--verbose` works as well.

    $ scraperrr -p 500 -c examples/gvtk131_config.json

Politeness, defines a waiting period in miliseconds between HTTP requests. `--politeness` works as well.

## Writing own configurations

The config format is still in development and changes occasionally. Once, it is freezed full documentation will be provided.

## Features

  * Flexible configuration files for scraping websites and exporting results to a specified JSON file
  * Waiting period between HTTP-requests

## More Information

  * [Spickerrr in Google Play store](http://pirat.ly/spickerrr)
  * [Spickerrr blog](http://spickerrr.tumblr.com/)
  * [Antragsbücher online](http://pirat.ly/spicker)

