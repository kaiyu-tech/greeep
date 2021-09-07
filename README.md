## greeep

This is a Grep-like application.

caution: This app will generate a sqlite file in the current directory.

## install

```bash
npm install -g greeep
```

## usage

### 1. Create a .greeepignore

```bash
$ vi .greeepignore
```

The description rules are exactly the same as for ".gitignore".

[Toptal | Gitignore.io](https://www.toptal.com/developers/gitignore) is recommended for automatic file generation.

### 2. You can register your frequently used regular expressions.

```bash
$ greeep -a 'TODO:|FIXME:|HACK:'
$ greeep -a 'REVIEW:|CHANGED:|NOTE:|WARNING:'
$ greeep -a 'require\(.*\)'
```

### 3. You do not need to register to use it.

```bash
$ greeep 'TODO:|FIXME:|HACK:'
$ greeep 'REVIEW:|CHANGED:|NOTE:|WARNING:'
$ greeep 'require\(.*\)'
```

※ Cannot be used with '-a' or '-d'.

### 4. You can run it from among the registered ones.

```bash
$ greeep
? Pick a regexp • 
❯ TODO:|FIXME:|HACK:
  REVIEW:|CHANGED:|NOTE:|WARNING:
  require\(.*\)
```

### 5. You can delete the ones you no longer need.

```bash
$ greeep -d
? Pick a regexp • 
❯ TODO:|FIXME:|HACK:
  REVIEW:|CHANGED:|NOTE:|WARNING:
  require\(.*\)
```

### 6. You can change the directory.

```bash
$ greeep -c ~/work/projectB
```

### 7. Only the first matching line of the file can be displayed.

```bash
$ greeep -f
```

### 8. It is case-insensitive and can be used for matching.

```bash
$ greeep -i
```
