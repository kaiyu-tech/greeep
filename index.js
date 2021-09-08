#!/usr/bin/env node

'use strict'

class Database {
  constructor () {
    const sqlite3 = require('sqlite3').verbose()
    this.db = new sqlite3.Database('./greeep.db')

    this.initialize()
  }

  initialize () {
    this.db.serialize(() => {
      this.db.run('CREATE TABLE IF NOT EXISTS regexp (id INTEGER PRIMARY KEY, regexp TEXT UNIQUE NOT NULL)')
    })
  }

  insert (regexp) {
    this.db.serialize(() => {
      this.db.run('INSERT OR IGNORE INTO regexp (regexp) VALUES (?)', regexp)
    })
  }

  select () {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.all('SELECT * FROM regexp ORDER BY regexp', function (err, rows) {
          err ? reject(err) : resolve(rows)
        })
      })
    })
  }

  delete (id) {
    this.db.serialize(() => {
      this.db.run('DELETE FROM regexp WHERE id = (?)', id)
    })
  }
}

class Prompt {
  select (rows) {
    const regexps = []

    rows.forEach((row) => {
      const regexp = {
        name: row.regexp.split('\n')[0],
        value: { id: row.id, regexp: row.regexp }
      }
      regexps.push(regexp)
    })

    const colors = require('ansi-colors')
    const { Select } = require('enquirer')

    const prompt = new Select({
      name: 'regexps',
      message: colors.yellowBright('Pick a regexp'),
      choices: regexps,
      limit: 5,
      footer: regexps.length > 5 ? colors.blue('(Scroll up and down to reveal more choices)') : '',
      result () {
        return this.focused.value
      },
      separator () {
        return this.style(this.symbols.bullet)
      }
    })

    return prompt.run()
  }
}

(async () => {
  const option = require('minimist')(process.argv.slice(2))

  if (option._.length === 0) {
    if (option.v) {
      console.log('1.0.6')
    } else {
      const db = new Database()
      if (option.a) {
        db.insert(option.a)
      } else {
        const rows = await db.select()
        if (rows.length === 0) {
          console.log('No data.')
        } else {
          const prompt = new Prompt()
          const row = await prompt.select(rows)
          if (option.d) {
            db.delete(row.id)
          } else {
            option._.push(row.regexp)
          }
        }
      }
    }
  }

  if (option._.length !== 0) {
    const path = require('path')
    const fs = require('fs')
    const ignore = require('ignore/legacy')()
    if (fs.existsSync('.greeepignore')) ignore.add(fs.readFileSync('.greeepignore').toString())

    if (option.c) process.chdir(option.c)

    const target = process.cwd()

    function DirectoriesOrFiles (target) {
      return fs.readdirSync(target, { withFileTypes: true }).flatMap(dirent => {
        const filePath = path.relative(process.cwd(), `${target}/${dirent.name}`)
        return (dirent.isFile() || dirent.isSymbolicLink()) ? [filePath] : DirectoriesOrFiles(filePath)
      })
    }

    DirectoriesOrFiles(target)
      .forEach(filePath => {
        if (ignore.ignores(filePath)) return
        const regexp = new RegExp(option._[0], option.i ? 'i' : '')
        const contents = fs.readFileSync(filePath, 'utf-8')
        const lines = contents.split('\n')
        if (option.f) {
          const index = lines.findIndex(line => line.match(regexp))
          if (index !== -1) console.log(`${filePath}:${index + 1}: ${lines[index].trim()}`)
        } else {
          lines.map((line, index) => line.match(regexp) ? index : -1)
            .filter(index => index !== -1)
            .forEach(index => console.log(`${filePath}:${index + 1}: ${lines[index].trim()}`))
        }
      })
  }
})()
