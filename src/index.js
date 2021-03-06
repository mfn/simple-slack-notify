//         ___ _            _
//        / __(_)_ __  _ __| |___
//        \__ \ | '  \| '_ \ / -_)
//    ___ |___/_|_|_|_| .__/_\___| _   _  __
//   / __| |__ _ __| ||_|| \| |___| |_(_)/ _|_  _
//   \__ \ / _` / _| / / | .` / _ \  _| |  _| || |
//   |___/_\__,_\__|_\_\ |_|\_\___/\__|_|_|  \_, |
//  Slack notification action that just works |__/
// Copyright 2020 Adam K Dean <adamkdean@googlemail.com>

const core = require('@actions/core')
const { IncomingWebhook } = require('@slack/webhook')

try {
  const slack = new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)

  /* eslint-disable no-eval */
  const env = process.env // eslint-disable-line
  const envsubst = (string, json = false) => {
    const s = eval(`\`${string}\``)
    return json ? JSON.parse(s) : s
  }

  const channel = envsubst(core.getInput('channel'))
  const username = envsubst(core.getInput('username'))
  const status = envsubst(core.getInput('status'))
  const successText = envsubst(core.getInput('success_text'))
  const failureText = envsubst(core.getInput('failure_text'))
  const cancelledText = envsubst(core.getInput('cancelled_text'))
  const fields = envsubst(core.getInput('fields'), true)

  let color = envsubst(core.getInput('color'))
  let text = envsubst(core.getInput('text'))

  // If color isn't set but status is, infer the color
  if (!color && status === 'success') {
    color = 'good'
  } else if (!color && status === 'failure') {
    color = 'danger'
  } else if (!color && status === 'cancelled') {
    color = 'warning'
  }

  // If text isn't set, check for status specific text
  if (!text && status === 'success' && successText) {
    text = successText
  } else if (!text && status === 'failure' && failureText) {
    text = failureText
  } else if (!text && status === 'cancelled' && cancelledText) {
    text = cancelledText
  }

  // Send the notification
  ;(async () => {
    await slack.send({
      channel,
      username,
      attachments: [
        {
          fallback: text,
          text,
          color,
          fields
        }
      ]
    })
  })()
} catch (error) {
  core.setFailed(error.message)
}
