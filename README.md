# Codeforces cli tool

This is a command line tool for Codeforces.

## Features

There are two modes available: interactive and non-interactive mode.

To use in interactive mode:
```bash
$ codeforces
> <command> [command args]
```
in non-interactive mode:
```bash
$ codeforces <command> [command args]
```

use `exit` to exit in interactive mode.

## Commands

Current supported commands are:

### login
    usage: login
This command only available in non-interactive mode. Input your handle and password when it prompts.


### submit
    usage: submit </path/to/file>
Now only support cpp files, and default to use C++11 complier.
Notice that if this command are run in interactive mode, you have to login before. In case of non-interactive mode, you can login at same time when you submit.

## Installation
```bash
$ npm install -g codeforces-cli-tool
$ mkdir ~/.codeforces-cli-tool
$ touch ~/.codeforces-cli-tool/cookie.json
```
