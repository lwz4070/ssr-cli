#!/usr/bin/env node

//在代码的开头第一行，必须指定我们的脚本执行所需要的解释程序。在这里，我们使用node来作为脚本的解释程序。
//而我们#! /usr/bin/env node这样写，目的是使用env来找到node，并使用node来作为程序的解释程序

const fs = require('fs');
const program = require('commander'); // 用来自动的解析命令和参数，用于处理用户输入的命令
const download = require('download-git-repo'); //下载并提取git仓库，用于下载项目模版
const inquirer = require('inquirer'); //通用的命令行用户界面集合，用于和用户进行交互
const handlebars = require('handlebars'); //模版引擎，将用户提交的信息动态填充到文件中
const ora = require('ora'); //下载过程久的话，可以用于显示下载中的动画效果
const chalk = require('chalk'); //可以给终端的字体加上颜色
const logSymbols = require('log-symbols'); //可以在终端显示√ 或 X 等图标

program.version('1.0.0', '-v', '--version') //将 -v 和 --version 添加到命令中
    .command('init <name>')   // 定义 init 命令
    .action((name) => { //执行命令后所执行的方法。
        if (!fs.existsSync(name)) {
            // 命令行交互
            inquirer.prompt([
                {
                    name: 'description',
                    message: '输入项目描述'
                },
                {
                    name: 'version',
                    message: '输入项目版本'
                },
                {
                    name: 'author',
                    message: '输入作者名称'
                }
            ]).then((answers) => {
                const spinner = ora('正在下载模版...');
                spinner.start();
                download('https://github.com:lwz4070/ssr_2#master', name, {clone: true}, (err) => {
                    if (err) {
                        //下载失败
                        spinner.fail();
                        console.log(logSymbols.error,chalk.red(err));
                    } else {
                        //下载结束
                        spinner.succeed();
                        const meta = {
                            name,
                            description: answers.description,
                            version: answers.version,
                            author: answers.author
                        };
                        const fileName = `${name}/package.json`;
                        if (fs.existsSync(fileName)) {
                            // 读取package.json文件，将handlebars渲染后的模版重新写入到文件中
                            const content = fs.readFileSync(fileName).toString();
                            const result = handlebars.compile(content)(meta);
                            fs.writeFileSync(fileName, result);
                        }
                        console.log(logSymbols.success, chalk.green('项目初始化完成！'));
                    }
                });
            });
        } else {
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(logSymbols.error, chalk.red('项目已存在'));
        }
    });
program.parse(process.argv); // program.parse 解析命令行参数argv