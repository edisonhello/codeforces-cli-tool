# Codeforces cli tool

This is a command line tool for Codeforces. This tool is temperary duplicated.

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
    Usage: login
This command only available in non-interactive mode. Input your handle and password when it prompts.

### submit
    Usage: submit </path/to/file> [--watch] [--contest <contest_id>/--gym <gym_id>/--mashup <mashup_id>]
<del>Now only support cpp files, and default to use C\+\+11.</del>
Now you can run `set init` to setup default complier based on file extensions. More information, see [Supports](#Supports) and [set](#set).

If `watch` option is provided, a real-time update will active until verdict reveal. Update rate depend on network speed. If this field is empty, the submission id will be printed.

One can add `--contest` options to specify which contest will be submitted to. The priority of this option is higher than file name described below. Same as `--gym` and `--mashup`.

Notice that if this command are run in interactive mode, you have to login in non-interactive mode first. In case of non-interactive mode, you can login at same time when you submit. 

#### File Name

File should be named as `problem.ext`. For example, `977D.cpp` is a C++ solution for problem `977D`, and this is not case sensitive.

If `--contest`(or another two options) are provided, file can be named as `*index.ext`. That is, `meowF.cpp` will be send to problem F of the specified contest.

### set
    Usage: set <init/cookie/compiler> [compiler options]

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
 - contest mode
 - fetch sample testdata

## Known bugs

 - Due to Codeforce's new authorize method, this tool can not work now.

## Change log

#### 1.5.1 2020-02-18
Specify contests/gyms/mashups in options. 

Allowing file name without contest id if this option is set.

#### 1.5.0 2020-02-18
Allow submit to contests/gyms. Submission in contests should work with this feature. Mashups is not tested.

#### 1.4.6 2020-02-17
Keep fixing fetch submission id issue.

#### 1.4.4 2020-02-17
Fit into new codeforces html format.

#### 1.4.2 2018-05-17
Fix bugs.

Add colors to verdict.

#### 1.4.0 2018-05-17
Live submission status are added.

Remove inquirer.

#### 1.3.0 2018-05-16
Show submission id after submit.

Prevent multiple command running at same time.

Add change log.

#### 1.2.3 2018-05-16
Add more languages (now accourding to problem status to add new language). <del> I will add it after I saw it. </del>

#### 1.2.2 2018-05-15
Add `config` command (in version 1.2.0).

Make language(compiler) chooable.

Due to inquirer's rawlist display bug, try to use enquirer.

Change `config` to `set`.


#### 1.1.2 2018-05-10
Add `login` command.

First time to write `README`.

Use `~/.codeforces-cli-tool` directory to store files.

Register `codeforces` command.

Make this package runnable.

#### 1.0.1 2018-05-09 (no release)
Modulize some function in submit.

Store cookie to prevent login everytime.

#### 1.0.0 2018-05-02
Finish basic submit feature.

Add non-interactive mode, commands which use `inquirer` banned in interactive mode.

#### 0.1.0 2018-05-02 (no release)
Successul get CSRF token.

Readline will get inquirer input, maybe stdin confilct or something?

#### 0.0.0 2018-05-01 (no release)
Project start.
