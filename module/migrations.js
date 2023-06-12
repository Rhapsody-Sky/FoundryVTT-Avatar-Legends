/**
 * Run all migrations
 */
export async function migrateWorld() {
  console.log('legends | Migration script called')

  // Moves marked rollable
  migrateMoves()

  // Update images to .webp
  migrateWorldItems()
}

/**
 * Update all moves
 */
async function migrateMoves() {
  // Update world moves
  let moves = game.items.contents.filter((item) => item.type === 'move')
  moves.forEach((move) => {
    migrateMove(move)
  })

  // Update world actor moves
  game.actors.contents
    .filter((actor) => actor.type === 'player')
    .forEach((actor) => {
      let actorMoves = actor.items.contents.filter(
        (item) => item.type === 'move',
      )

      if (actorMoves.length > 0) {
        console.log(`legends | Migrating moves for actor ${actor.id}...`)
        actorMoves.forEach((move) => {
          migrateMove(move)
        })
      }
    })
}

/**
 * Update a single Move item
 * @param {Item} move The Item representing the Move to update
 */
async function migrateMove(move) {
  let rollable = move.system.rollable
  let rollStat = move.system.rollStat

  if (rollStat && !rollable) {
    console.log(`legends | Migrating Move ${move.id}`)
    move.update({
      data: {
        rollable: true,
      },
    })
  }
}

/**
 * Migrate images to .webp versions
 */
const migrateWorldItems = async () => {
  console.log('legends | Migrating images to .webp...')
  const pngRegex = /systems\/legends\/.+\.png$/

  const worldItems = game.items.filter((item) => item.img.match(pngRegex))
  migrateItemImages(worldItems)

  const worldActors = game.actors.filter((actor) => actor.img.match(pngRegex))
  migrateItemImages(worldActors)

  game.actors.forEach((actor) => {
    const actorItems = actor.items.filter((item) => item.img.match(pngRegex))
    migrateItemImages(actorItems)
  })

  game.scenes.forEach((scene) => {
    const sceneTokens = scene.tokens.filter((token) =>
      token.texture.src.match(pngRegex),
    )
    migrateItemImages(sceneTokens)
  })
}

/**
 * Update a collection
 * @param {[Object]} objects
 */
const migrateItemImages = async (objects) => {
  for (const object of objects) {
    migrateItemImage(object)
  }
}

/**
 * Update a single Document
 * @param {Object} object The document to update
 */
const migrateItemImage = async (object) => {
  console.log(
    `legends | Migrating img for ${object.documentName} ${object.type} ${object.id}`,
  )
  const newImg = object.img.replace(/.png$/, '.webp')
  object.update({
    img: newImg,
  })
}
