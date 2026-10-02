const { DialogV2 } = foundry.applications.api
const { renderTemplate } = foundry.applications.handlebars

export const rollDialog = async (title, template, data = {}, fieldNames = []) => {
  const content = await renderTemplate(template, data)

  const result = DialogV2.wait({
    window: { title },
    position: {
      width: 500,
    },
    classes: ['legends'],
    content,
    buttons: [
      {
        label: 'legends.roll.dialog.submit',
        class: 'dialog-button yes',
        action: 'roll',
        callback: async (_event, button, _dialog) => {
          return {
            values: valuesFromFields(button.form.elements, fieldNames),
          }
        },
      },
      {
        label: 'legends.dialog.cancel',
        class: 'dialog-button no',
        action: 'cancel',
        callback: async (_event, _button, _dialog) => {
          return null
        },
      },
    ],
  })

  return result
}

const valuesFromFields = (formElements, fieldNames = []) => {
  const values = {}
  for (const fieldName of fieldNames) {
    values[fieldName] = formElements[fieldName]?.value
  }
  return values
}
