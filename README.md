# TAB Photobooth

Node app used at various events within a photo booth. It shows photos taken in the browser.

The normal setup is:

# [Adobe Lightroom](http://www.adobe.com/uk/products/photoshop-lightroom.html) is run on the computer and setup to save photos taken into a specific directory
# This app is run, it includes two parts:
## A backend using socket.io that constantly monitors the directory for new photos and notifies the frontend about them
## An AngularJS front-end that cycles through all photos in the directory and displays them in browser. If a new photo is taken it animates to that before recommencing the cycling


## How to setup

# Install [node](https://nodejs.org/en/download/)
# By default the directory this expects photos to be saved into is ./public/linked-photos. 
You can make ./public/linked-photos a [symlink](http://osxdaily.com/2015/08/06/make-symbolic-links-command-line-mac-os-x/) though to another directory if you prefer  
# Run Lightroom and set it to store photos in the directory you configured above   

### Running the app

Runs like a typical express app:

```shell
node app.js
```

### Updating libraries

You can update AngularJS with [Bower](http://bower.io):

```shell
bower update angular
```

You can update other libraries like Express using [NPM](http://bower.io):

```shell
npm update express
```

A description of the difference between bower and npm (and why this uses both) is here: http://stackoverflow.com/questions/18641899/what-is-the-difference-between-bower-and-npm


## Directory Layout
    
    app.js                  --> bootstraps the application
    bower.json              --> bower config
    package.json            --> npm config
    public/                 --> all of the source code and stylesheets
      css/                  --> css files
        app.css             --> default stylesheet      
      js/                   --> javascript files
        app.js              --> declare top-level app module
        controllers.js      --> application controllers
        directives.js       --> custom angular directives
        filters.js          --> custom angular filters
        services.js         --> custom angular services
      bower_components/     --> installed bower packages
        angular/            --> angular.js
        angular-socket-io/  --> socket.io adapter for angular
    routes/
      index.js              --> route for serving HTML pages and partials
    views/
      index.jade            --> main page for app
      layout.jade           --> doctype, title, head boilerplate
      partials/             --> angular view partials (partial jade templates)        



## Need help?

Jason Turner, Will Thomas and Ahmet Atasoy have worked with this before.