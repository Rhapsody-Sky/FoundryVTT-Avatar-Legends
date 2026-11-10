import { legends } from './config.js'
const { enrichHTML } = foundry.applications.ux.TextEditor.implementation
const { renderTemplate } = foundry.applications.handlebars

export const onlyUnique = (array) => {
  return array.filter((value, index, array) => array.indexOf(value) === index)
}

export const enrich = async (html, secrets = false) => {
  if (html) {
    return await enrichHTML(html, {
      secrets: secrets,
      async: true,
    })
  } else {
    return html
  }
}

export const enrichInlineMove = async (match) => {
  const uuid = match[1]
  const item = await fromUuid(uuid)
  const itemName = match[2] ?? item.name

  const container = document.createElement('div')
  container.className = 'inline-item'
  let html = ''
  if (item) {
    html = `<h3 class="font-title mb-25">@UUID[${uuid}]{${itemName}}</h3>${item.system.description}`
  } else {
    html = `@UUID[${uuid}]{${itemName}}`
  }

  container.innerHTML = await enrichHTML(html, { async: true })
  return container
}

export const enrichInlineTechnique = async (match) => {
  const uuid = match[1]
  const item = await fromUuid(uuid)
  const itemName = match[2] ?? item.name

  const container = document.createElement('div')
  container.className = 'inline-item'
  let html = ''
  if (item) {
    let { approach, training, specialty, description } = item.system
    html = `<h3 class="font-title mb-25">@UUID[${uuid}]{${itemName}}`
    if (specialty) {
      html += `<span class='ml-50 font-title flex0 nowrap specialty ${training}'>${specialty}</span>`
    } else if (training) {
      html += trainingIcon(training, 'ml-50')
    }
    html += `</h3>`
    html += `<p class="font-title color-fire-dark m-0">${game.i18n.localize(`legends.techniques.approaches.${approach}`)}</p>`
    html += description
  } else {
    html = `@UUID[${uuid}]{${itemName}}`
  }

  container.innerHTML = await enrichHTML(html, { async: true })
  return container
}

export const enrichNpc = async (match) => {
  const uuid = match[1]
  const npc = await fromUuid(uuid)

  const npcName = match[2] ?? npc?.name

  const container = document.createElement('div')
  container.className = 'inline-npc'
  let html = `<h3>@UUID[${uuid}]{${npcName}}</h3>`

  if (npc && npc.type === 'npc') {
    html = await renderTemplate(`${legends.rootPath}/templates/partials/v2/inline-npc.hbs`, {
      ...npc,
      uuid: npc.uuid,
      config: legends,
    })
  }

  container.innerHTML = await enrichHTML(html, { async: true })
  return container
}

export const enrichSkillName = async (match) => {
  const [_m, text] = match
  const container = document.createElement('span')
  const classNames = ['skill-name']
  container.className = classNames.join(' ')
  container.innerHTML = text
  return container
}

export const viewNotesTab = (document) => {
  return document.type == 'player' && !!game.settings.get('avatar-legends', 'playerNotes')
}

export const toggleDrawer = async (document, target) => {
  if (!document.isOwner) return

  const { itemId } = target.dataset
  const item = document.items.get(itemId)

  if (!item) return

  $(`#drawer-${itemId}`).slideToggle({
    done: async () => {
      await toggleVisibility(item)
    },
  })
}

const toggleVisibility = async (item) => {
  const visible = !!item.system.visible ? false : true

  await item.update({
    system: {
      visible,
    },
  })
}

export const editImage = async (event, target, document) => {
  event.preventDefault()

  const field = target.dataset.field || 'img'
  const current = foundry.utils.getProperty(document, field)

  const fp = new foundry.applications.apps.FilePicker({
    type: 'image',
    current: current,
    callback: (path) => document.update({ [field]: path }),
  })

  fp.render(true)
}

export const trainingIcon = (training, cssClasses = null) => {
  let tooltip = game.i18n.localize(`legends.training.${training}`)
  if (game.settings.get('avatar-legends', 'trainingIconsEnabled')) {
    //fontawesome
    return `<i class="${legends.trainingIcons[training]} color-${training} ${cssClasses}" data-tooltip="${tooltip}"></i>`
  } else {
    // image
    return `<img
          src='systems/avatar-legends/images/${training}.webp'
          data-tooltip='${tooltip}'
          alt='${tooltip}'
          class='flex0 ${cssClasses}'
        />`
  }
}
