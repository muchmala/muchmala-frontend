Muchmala-frontend
=================

Frontend server (and clientside) for Muchmala

Frontend server provides authentication, images uploading and serves static. Also it
includes Jakefile that allows static minification and uploading to s3.

# Installation

    npm install muchmala-frontend --registry http://registry.npm.muchmala.com

or

    git clone https://github.com/muchmala/muchmala-frontend.git
    cd muchmala-frontend
    git submodule update --init --recursive
    npm install --registry http://registry.npm.muchmala.com

# Main jake tasks

    [sudo] jake install            # Installs project. After that you can run
    [sudo] node index.js

    jake static-upload             # Upload static files to storage

To see full list, you can run

    jake --tasks

in project folder.
