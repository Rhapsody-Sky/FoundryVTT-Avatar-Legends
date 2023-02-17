/**
 * Roll a stat with the given statValue, and render it
 * in the Chat with the statName (and moveName, if
 * provided.)
 * @returns 
 */
export async function RollStat({
  statValue = null,
  statName = null,
  moveName = null,
  approach = null,
} = {}){
  // Fetch the bonus/penalty values from the dialog
  const rollOptions = await GetRollOptions(statName, moveName, statValue);

  // Don't bother continuing if the roll was cancelled.
  if(rollOptions.cancelled){ return; }

  // Set up the default roll values
  const neg = statValue < 0;
  const abs_stat = Math.abs(statValue);

  const rollData = {
    oStat: (neg ? '-' : '+'),
    vStat: abs_stat
  }

  // Basic roll formula
  const rollFormula = "2d6 @oStat @vStat";

  // If a non-zero bonus was set
  const bonus = rollOptions.bonus;
  if(bonus != 0){
    rollData.vBonus = Math.abs(bonus); // Ignore negatives
    rollFormula += " + @vBonus"; // Always add
  }

  // If a non-zero penalty was set
  const penalty = rollOptions.penalty;
  if(penalty != 0){
    rollData.vPenalty = Math.abs(penalty); // Ignore negatives
    rollFormula += " - @vPenalty"; // Always subtract
  }

  // Roll the dice and render the result
  const roll = new Roll(rollFormula, rollData);
  const rollResult = await roll.roll({async: true});
  const renderedRoll = await rollResult.render();

  // Setup the roll template
  const messageTemplate = "systems/legends/templates/partials/chat/stat-roll.hbs";
  const templateContext = {
    name: statName,
    move: moveName,
    roll: renderedRoll,
    total: rollResult._total,
    approach: approach
  }

  // Setup the chat message
  const chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    roll: rollResult,
    content: await renderTemplate(messageTemplate, templateContext),
    sound: CONFIG.sounds.dice,
    type: CONST.CHAT_MESSAGE_TYPES.ROLL
  };

  return ChatMessage.create(chatData);
}

/**
 * Display a Dialog to collect roll options (bonuses, penalties, etc.)
 * @param {String} statName The name of the Stat being rolled
 * @param {String} [moveName] The name of the Move used (optional)
 * @param {Number} [statValue] The value of the Stat being rolled (optional)
 * @returns A Promise representing the Dialog to be displayed
 */
async function GetRollOptions(statName, moveName = null, statValue = null){
  const template = "systems/legends/templates/partials/dialog/roll-dialog.hbs";
  const html = await renderTemplate(template, { statName: statName, statValue: statValue });
  const title = (moveName !== null) ? moveName : game.i18n.format('legends.roll.no-stat');

  return new Promise(resolve => {
    const data = {
      title: title,
      content: html,
      buttons: {
        normal: {
          label: `<i class="fas fa-dice"></i> ${game.i18n.localize("legends.roll.dialog.submit")}`,
          callback: html => resolve(_processRollOptions(html))
        },
        cancel: {
          label: `<i class="fas fa-times"></i> ${game.i18n.localize("legends.dialog.cancel")}`,
          callback: html => resolve({ cancelled: true })
        }
      },
      default: "normal",
      close: () => resolve({ cancelled: true })
    };
    new Dialog(data, { classes: ["dialog", "legends-dialog"] }).render(true);
  });
}

/**
 * A callback to parse and format the values returned from the dialog
 * @param {String} html The HTML returned from the form
 * @returns A hash of the relevant values from the form.
 */
function _processRollOptions(html){
  const form = html[0].querySelector('form');

  return {
    penalty: parseInt(form.penalty.value),
    bonus: parseInt(form.bonus.value)
  }
}
