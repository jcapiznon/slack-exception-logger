'use strict'

const reekoh = require('reekoh')
const _ = require('lodash')
const _plugin = new reekoh.plugins.ExceptionLogger()

let slackConfig = {}
let slackClient

_plugin.on('exception', (error) => {
  let notification = _.clone(slackConfig)

  _.extend(notification, {
    text: error.stack
  })

  slackClient.send(notification, (error) => {
    if (!error) return

    console.error('Error on Slack.', error)
    _plugin.logException(error)
  })

  _plugin.log(JSON.stringify({
    title: 'Exception sent to Slack',
    data: {message: error.message, stack: error.stack, name: error.name}
  }))
})

_plugin.once('ready', () => {
  let Slack = require('node-slack')

  _.extend(slackConfig, {
    channel: _.startsWith(_plugin.config.channel, '#') ? _plugin.config.channel : '#' + _plugin.config.channel,
    username: _plugin.config.username
  })

  slackClient = new Slack(_plugin.config.webhook)

  _plugin.log('Slack Exception Logger has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
