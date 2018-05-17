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
    usage: submit </path/to/file> [submission options]
<del>Now only support cpp files, and default to use C\+\+11.</del>
Now you can run `set init` to setup default complier based on file extensions. More information, see [Supports](#Supports) and [set](#set).
If options is `watch` or `wait`, a real-time update will active until verdict reveal. Update rate depend on network speed.
Notice that if this command are run in interactive mode, you have to login before. In case of non-interactive mode, you can login at same time when you submit. File should be named as problem.language. For example, 977D.cpp is a C++ solution for problem 977D. And this is not case sensitive.

### set
    usage: set <init/cookie/compiler> [compiler options]

Only `set cookie` are available in interactive mode. Others are only available in non-interactive mode.
Directory `~/.codeforces-cli-tool` must exist when execute this command except `set init`.
#### init
Run `set init` at after install this package and follow the instruction to setup. Unless you are sure to refresh both cookie and compiler, do not run `init` after first time using it. This package will use `~/.codeforces-cli-tool` to store some file.
#### cookie
The only way to logout from Codeforces currently.
#### compiler
If no following options, this will lead you to set all choosable compiler for each extensions, or only the specific extentions will be set. Options are `c`,`cpp`,and `py`.

## Installation
```bash
$ npm install -g codeforces-cli-tool
$ codeforces set init
```
You can also manually add a empty file `~/.codeforces-cli-tool/cookie.json` to use default compiler settings without running init.

## Supports

### Supporting extensions
 - `.c` default using `GNU GCC 5.1.0`
 - `.cpp` default using `GNU G++11 5.1.0`
 - `.py` default using `Python 3.6`
 - `.go` using `Go 1.8`
 - `.pl` using `Perl 5.20.1`
 - `.java` using `Java 1.8.0_131`
 - `.cs` using `C# Mono 5`
 - `.hs` using `Haskell GHC 7.8.3`

If more extensions are needed, please issued it or talk to me.

## Coming soon

 - do not need to name file as problem code anymore
     - command like `submit sol.cpp 977D` will work
 - add color to status verdict
 - contest mode
 - fetch sample testdata

## Change log

#### 1.4.0 2018-05-17
live submission status are added

#### 1.3.0 2018-05-16
now show submission id after submit
prevent multiple command running at same time
add change log

#### 1.2.3 2018-05-16
add more languages (now accourding to problem status to add new language). <del> I will add it after I saw it. </del>

#### 1.2.2 2018-05-15
add `config` command (in version 1.2.0)
make language(compiler) chooable
due to inquirer's rawlist display bug, try to use enquirer
change `config` to `set`


#### 1.1.2 2018-05-10
add `login` command
first time to write `README`
use `~/.codeforces-cli-tool` directory to store files
register `codeforces` command
make this package runnable

#### 1.0.1 2018-05-09 (no release)
modulize some function in submit
store cookie to prevent login everytime

#### 1.0.0 2018-05-02
finish basic submit feature
add non-interactive mode, commands which use `inquirer` banned in interactive mode.

#### 0.1.0 2018-05-02 (no release)
successul get CSRF token
readline will get inquirer input, maybe stdin confilct or something?

#### 0.0.0 2018-05-01 (no release)
project start.
