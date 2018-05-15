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
Now you can run `init` to setup default complier based on file extensions. More information, see [Supports](#Supports) and [init](#init).
Notice that if this command are run in interactive mode, you have to login before. In case of non-interactive mode, you can login at same time when you submit.

### init
    usage: init [config/cookie]
If no following arguments, both of config and cookie will going to initialize. Notice there should not be a file named `.codeforces-cli-tool` in your home directory. After initialize, `config.json` and `cookie.json` in `~/.codeforces-cli-tool` will be replaced. Follow the instruction after execute this command to setup cookie/config.

## Installation
```bash
$ npm install -g codeforces-cli-tool
$ codeforces init
```

## Supports

### Supporting extensions
 - `.c`
 - `.cpp`
 - `.py`
 - `.go`
 - `.pl`

If more extensions are needed, please issued it or talk to me.
