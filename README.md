grunt-parallelize [![NPM version][npm-image]][npm-url] [![build status][travis-image]][travis-url] [![Dependency Status][deps-image]][deps-url]
====

> Make your task parallel.

This plugin divides src files of your task and executes them in parallel.

If your task has too many src files and it's CPU intensive like JSHint, this plugin reduces your build time significantly.

#### Before (36sec to jshint 1640 files)

![Before](https://raw.github.com/teppeis/grunt-parallelize/master/misc/before.png "Before")

#### Parallelize!  (14sec to jshint 1640 files by 4 parallel)

![Parallelize!](https://raw.github.com/teppeis/grunt-parallelize/master/misc/after.png "Parallelize!")

## Getting Started
If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide.
Then you can install this plugin to your project with:

```shell
$ npm install grunt-parallelize --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-parallelize');
```

In your project's Gruntfile, add a section named `parallelize` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  jshint: {
    all: {
      src: './**/*.js'
    }
  },
  parallelize: {
    jshint: {
      // Run jshint:all task with 2 child processes in parallel.
      all: 2
    },
  },
});
```

And just prefix `parallelize:` to your task name.

```shell
# Normal single process
$ grunt jshint:all
Running "jshint:all" (jshint) task
>> 101 files lint free.

Done, without errors.

# Parallelize!
$ grunt parallelize:jshint:all
Running "parallelize:jshint:all" (parallelize) task
    
    Running "jshint:all" (jshint) task
    >> 51 files lint free.
    
    Done, without errors.
    
    Running "jshint:all" (jshint) task
    >> 50 files lint free.
    
    Done, without errors.
    
Done, without errors.
```

### Why grunt-parallelize?

There are concurrent or parallel processing grunt plugins like [grunt-concurrent](https://github.com/sindresorhus/grunt-concurrent) or [grunt-parallel](https://github.com/iammerrick/grunt-parallel).
They execute different tasks in parallel, but this plugin divides a task into multi processes.

## Configuration

### Options

#### options.processes
Type: `Number`

A number of processes.

This is equivalent with the above.
```js
  parallelize: {
    options: {
      processes: 2
    },
    jshint: {
      all: true
    },
  },
```

### Files format

grunt-parallelize supports all [Grunt standard files formats](http://gruntjs.com/configuring-tasks#files).

* [Compact Format](http://gruntjs.com/configuring-tasks#compact-format)
* [Files Object Format](http://gruntjs.com/configuring-tasks#files-object-format)
* [Files Array Format](http://gruntjs.com/configuring-tasks#files-array-format)
* [Dynamic Options](http://gruntjs.com/configuring-tasks#building-the-files-object-dynamically)

#### Only `src`

If only `src` is specified, the src files are devided per each process.

```js
grunt.initConfig({
  jshint: {
    all: {
      src: ['src/1.js', 'src/2.js', 'src/3.js']
    }
  },
  parallelize: {
    jshint: {
      all: 2
    },
  },
});
```

=> parallelized as:

* Process 1: `src/1.js` and `src/2.js`
* Process 2: `src/3.js`

#### Both `src` and `dest`

If `dest` is specified, the dest files are devided per each process.

```js
grunt.initConfig({
  concat: {
    all: {
      files: [
        {src: ['src/1.js', 'src/2.js'], dest: 'dest/1.js'},
        {src: ['src/3.js', 'src/4.js'], dest: 'dest/2.js'},
        {src: ['src/5.js'], dest: 'dest/3.js'},
      ],
    }
  },
  parallelize: {
    jshint: {
      all: 2
    },
  },
});
```

=> parallelized as:

* Process 1: `dest/1.js` (including 'src/1.js' and 'src/2.js') and `dest/2.js` (including 'src/3.js' and 'src/4.js')
* Process 2: `dest/3.js` (including 'src/5.js')

## Thanks

This plugin is inspired by [sindresorhus's grunt-concurrent](https://github.com/sindresorhus/grunt-concurrent). Thanks!

## Release History

* 2015-11-05 v1.1.3 Cleanup tmp files [#21](https://github.com/teppeis/grunt-parallelize/issues/21)
* 2015-11-05 v1.1.2 Change internal file format [#22](https://github.com/teppeis/grunt-parallelize/issues/22)
* 2015-11-05 v1.1.1 Update deps [#20](https://github.com/teppeis/grunt-parallelize/issues/20)
* 2015-03-23 v1.1.0 Support all file formats and `dest`. Fix ENAMETOOLONG [#13](https://github.com/teppeis/grunt-parallelize/issues/13)
* 2015-02-07 v1.0.1 Update dependencies, test with Node.js v0.12
* 2013-12-23 v1.0.0 Update dependencies
* 2013-11-22 v0.1.1 Replace deprecated grunt.util methods in grunt-0.4.2
* 2013-09-09 v0.1.0 First release

## License

MIT License: Teppei Sato &lt;teppeis@gmail.com&gt;

[npm-image]: https://img.shields.io/npm/v/grunt-parallelize.svg
[npm-url]: https://npmjs.org/package/grunt-parallelize
[travis-image]: https://travis-ci.org/teppeis/grunt-parallelize.svg?branch=master
[travis-url]: https://travis-ci.org/teppeis/grunt-parallelize
[deps-image]: https://david-dm.org/teppeis/grunt-parallelize.svg
[deps-url]: https://david-dm.org/teppeis/grunt-parallelize
