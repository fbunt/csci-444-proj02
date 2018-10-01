# Project 2: NEGIS

## Installing Dependencies

This project depends on browserify and http-server being globally installed by npm:

    npm install -g http-server browserify

The local dependencies are included in the package.json file. Run `npm
install` in the same directory as that file to install all of the local
dependencies. D3 is included in the html file as a link and doesn't need
to be installed.

Additionally, the data in the GreenlandInBedCoord.h5 file needs to be dumped into json files in the `data/` directory:

    mv /path/to/GreenlandInBedCoord.h5 ./data/
    cd src/
    python tojson.py
    cd ..

## Running

To build and run the project:

    make run

or

    make serve

This packages my Javascript and starts a local http server on port 8080. If it doesn't open a window in your browser, just point your browser to "localhost:8080".