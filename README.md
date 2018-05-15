# Codeforces cli tool

This is a command line tool for Codeforces.

## Usage

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
<del>Now only support cpp files, and default to use C++11 complier.</del>
Now you can run `set init` to setup default complier based on file extensions. More information, see [Supports](#Supports) and [set](#set).
Notice that if this command are run in interactive mode, you have to login before. In case of non-interactive mode, you can login at same time when you submit.

### set
    usage: set <init/cookie/compiler> [compiler options]
#### init
Run `init` at first time and follow the instruction to setup. Unless you are sure to refresh both cookie and compiler, do not run `init`.
#### cookie
The only way to logout from Codeforces currently.
#### compiler
If no following options, this will lead you to set all choosable compiler for each extensions, or only the specific extentions will be set. Options are `c`,`cpp`,and `py`.

## Installation
```bash
$ npm install -g codeforces-cli-tool
$ codeforces set init
```

## Supports

### Supporting extensions
 - `.c`
 - `.cpp`
 - `.py`
 - `.go`
 - `.pl`

If more extensions are needed, please issued it or talk to me.
