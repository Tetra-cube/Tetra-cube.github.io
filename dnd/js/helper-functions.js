const CalculateAverageCustomHP = (monHp, conMod) =>{
    let regExp = /^\d+d(?:4|6|8|10|12|20)$/
    if(!regExp.test(monHp)) {
        return monHp
    }
   
    let [numDice, dieType] = monHp.split('d')
    let average = parseInt(numDice) * (parseInt(dieType) + 1) / 2 + (parseInt(numDice) * parseInt(conMod))
    return `${Math.floor(average)} (${monHp})${!!conMod && conMod > 0 ? ` + ${parseInt(numDice) * parseInt(conMod)}` : ''}`
}