const axios = require("axios");
const e = require("express");
const { response } = require("express");
const { del } = require("express/lib/application");
const res = require("express/lib/response");
const rand = require("random-seed").create();
require("dotenv").config();

var cases = [
    {
        counts: [1, 1, 1],
        msg: "HIGH CARD",
        ranking: 1
    },
    {
        counts: [1, 2],
        msg: "PAIR",
        ranking: 2
    },
    {
        counts: [3],
        msg: "THREE OF A KIND",
        ranking: 5
    },
]
function count_duplicate(array) {
    var counts = [];
    var active = [];

    var array_copy = [...array];
    array_copy.forEach((i) => {
        counts[i] = (counts[i] || 0) + 1
        if (counts[i] > 1) {
            active.push(i);
        }
    });
    var actived = [];
    for (var i = 0; i < active.length; i++) {
        for (var j = 0; j < array_copy.length; j++) {
            if (array_copy[j] == active[i]) {
                actived.push(j);
            }
        }
    }
    counts = counts.filter((c) => {
        if (c) return c
    });
    counts = counts.sort();
    var result = {
        counts: counts,
        active: actived,
    }
    return result;
}
function arrayEquals(a, b) {
    return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
}
function getCases(counts) {
    var result;
    for (var score of cases) {
        if (arrayEquals(counts, score.counts)) {
            result = {
                msg: score.msg,
                ranking: score.ranking
            }
        }
    }
    return result;
}
function getArray(num, max) {
    var array = [];
    for (var i = 0; i < num;) {
        var random = getRandomInt(max);
        if (array.indexOf(random) == -1) {
            array[i] = random;
            i++;
        }
    }
    return array;
}
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
function getMaxIndex(array) {
    const max = Math.max(...array);
    const index = array.indexOf(max);
    return index;
}
function getMaxValue(array) {
    const max = Math.max(...array);
    return max;
}
function getPriceCases(amount, cases) {
    var cal;
    switch (cases) {
        case 1:
            cal = 0;
            break;
        case 2:
            cal = 1;
            break;
        case 3:
            cal = 3;
            break;
        case 4:
            cal = 6;
            break;
        case 5:
            cal = 30;
            break;
        case 6:
            cal = 40;
            break;
        case 7:
            cal = 50;
            break;
    }
    var total = amount * cal;
    return total;
}
function Straight(array) {
    var n = 0;
    var newArray = [];
    var sortArray = [];
    var active_array = [];
    for (var i = 0; i < array.length; i++) {
        newArray.push((array[i]) % 13);
    }
    sortArray = [...newArray];
    sortArray.sort(function (a, b) { return b - a });
    for (var i = 0; i < sortArray.length; i++) {
        if (sortArray[i] - sortArray[i + 1] == 1) {
            n++;
        }
        active_array.push(i);
    }
    var result;
    if (n == array.length - 1) {
        result = {
            active_array: active_array,
            bigNum: sortArray[0],
            state: true
        }
    } else {
        result = {
            active_array: [],
            bigNum: -1,
            state: false
        }
    }
    return result;
}
function MarkSame(array) {
    var n1 = 0;
    var n2 = 0;
    var n3 = 0;
    var n4 = 0;
    var loop = 0;
    var active_array = [];
    array.forEach((i) => {
        if (i >= 0 && i <= 12) {
            n1++;
        } else if (i >= 13 && i <= 25) {
            n2++;
        } else if (i >= 26 && i <= 38) {
            n3++;
        } else {
            n4++;
        }
        active_array.push(loop);
        loop = loop + 1;
    })
    var result;
    if (n1 == array.length || n2 == array.length || n3 == array.length || n4 == array.length) {
        result = {
            active_array: active_array,
            state: true
        }
    } else {
        result = {
            active_array: [],
            state: false
        }
    }
    return result;
}
function NumSame(array) {
    var countsArrays = count_duplicate(array);
    var cases = getCases(countsArrays.counts);
    var result;
    if (cases.msg == "HIGH CARD") {
        result = {
            msg: cases.msg,
            cases: cases.ranking,
            active_array: [getMaxIndex(array)],
            state: false
        }
    } else {
        result = {
            msg: cases.msg,
            cases: cases.ranking,
            active_array: countsArrays.active,
            state: true
        }
    }
    return result;
}
function Check(array) {
    var newArray = [];
    for (var i = 0; i < array.length; i++) {
        newArray[i] = array[i] % 13;
    }
    var msg = "";
    var cases;
    var active_array = [];

    var straight = Straight(newArray);
    var markCheck = MarkSame(array);
    var sameNum = NumSame(newArray);

    if (straight.state || markCheck.state) {
        if (straight.state && markCheck.state) {
            if (straight.bigNum == 12) {
                msg = "MINI ROYAL";
                cases = 7;
            } else {
                msg = "STRAIGHT FLUSH";
                cases = 6;
            }
        } else if (markCheck.state && !straight.state) {
            msg = "FLUSH";
            cases = 3;
        } else {
            msg = "STRAIGHT";
            cases = 4;
        }
        active_array = [0, 1, 2];
    } else {
        msg = sameNum.msg;
        cases = sameNum.cases;
        active_array = sameNum.active_array;
    }
    var result = {
        msg: msg,
        activeArray: active_array,
        cases: cases,
        array: newArray
    };
    return result;
}
function sizeDecision(array1, array2) {
    var sort1 = [...array1].sort(function (a, b) { return b - a });
    var sort2 = [...array2].sort(function (a, b) { return b - a });
    var msg = "";
    var n = 0;
    for (var i = 0; i < sort1.length; i++) {
        if (sort1[i] == sort2[i]) {
            msg = "equal";
            n = 0;
        } else if (sort1[i] > sort2[i]) {
            msg = "first";
            n = sort1[i];
            i = sort1.length - 1;

        } else {
            msg = "second";
            n = sort2[i];
            i = sort2.length - 1;
        }
    }
    var result;
    if (msg == "first") {
        result = {
            result: msg,
            index: array1.indexOf(n)
        }
    } else if (msg == "second") {
        result = {
            result: msg,
            index: array2.indexOf(n)
        }
    } else {
        result = {
            result: msg,
            index: n
        }
    }
    return result;
}
function ResultCheck(userArray, bortArray) {
    var response1 = Check(userArray);
    var response2 = Check(bortArray);
    var msg = "";
    var active_array = [];
    var cases;
    if (response1.cases == response2.cases) {
        if (response1.cases == 7) {
            active_array = [];
            msg = "TIE";
        } else if (response1.cases > 3 && response1.cases < 7) {
            var res1 = getMaxValue(response1.array);
            var res2 = getMaxValue(response2.array);
            if (res1 == res2) {
                active_array = [];
                msg = "TIE";
            } else if (res1 > res2) {
                active_array = response1.activeArray;
                msg = "winUser";
            } else {
                active_array = response2.activeArray;
                msg = "winBort";
            }
        } else {
            if (response1.msg == "PAIR") {
                var res1 = response1.array[response1.activeArray[0]];
                var res2 = response2.array[response2.activeArray[0]];
                if (res1 == res2) {
                    var res = sizeDecision(response1.array, response2.array);
                    if (res.result == "first") {
                        active_array = [res.index];
                        msg = "winUser";
                    } else if (res.result == "second") {
                        active_array = [res.index];
                        msg = "winBort";
                    } else {
                        active_array = [];
                        msg = "TIE";
                    }
                    msg = "TIE";
                } else if (res1 > res2) {
                    active_array = response1.activeArray;
                    msg = "winUser";
                } else {
                    active_array = response2.activeArray;
                    msg = "winBort";
                }
            } else {
                var res = sizeDecision(response1.array, response2.array);
                if (res.result == "first") {
                    active_array = [res.index];
                    msg = "winUser";
                } else if (res.result == "second") {
                    active_array = [res.index];
                    msg = "winBort";
                } else {
                    active_array = [];
                    msg = "TIE";
                }
            }
        }
    } else if (response1.cases > response2.cases) {
        active_array = response1.activeArray;
        msg = "winUser";
    } else {
        active_array = response2.activeArray;
        msg = "winBort";
    }
    if (msg == "winUser") {
        cases = response1.cases;
    } else {
        cases = response2.cases;
    }
    var result = {
        msg: msg,
        active_array: active_array,
        cases: cases
    }
    return result;
}
const user = [];
module.exports = {
    CardOder: async (req, res) => {
        const { userName, token } = req.body;
        var cardOrder = getArray(52, 52);
        user[token] = {
            cardArray: cardOrder,
            userName: userName,
            betAmount: 0,
            pairAmount: 0,
            antoAmount: 0,
            userToken: token,
            amount: 0,
            bort: 0
        }
        try {
            res.json({
                cardOder: user[token].cardArray,
                serverMsg: "Success"
            })
        } catch (err) {
            res.json({
                serverMsg: "Can't find Server!"
            })
        }
    },
    BetThreePoker: async (req, res) => {
        const { userName, antoAmount, pairAmount, token, amount } = req.body;
        var amountValue = parseFloat(amount);
        var antoValue = parseInt(antoAmount);
        var pairValue = parseInt(pairAmount);
        user[token].amount = amountValue;
        user[token].pairAmount = pairValue;
        user[token].antoAmount = antoValue;
        try {
            var UserCardArray = [];
            var BortCardArray = [];
            for (var i = 0; i < 6; i++) {
                if (i >= 0 && i < 3) {
                    UserCardArray.push(user[token].cardArray[i]);
                } else {
                    BortCardArray.push(user[token].cardArray[i])
                }
            }
            var response1 = Check(UserCardArray);
            var response2 = Check(BortCardArray);

            if (response2.cases > 1) {
                user[token].bort = 1;
            } else if (response2.cases == 1) {
                var newArray = [];
                for (var i = 0; i < BortCardArray.length; i++) {
                    newArray[i] = BortCardArray[i] % 13;
                }
                var max = getMaxValue(newArray)
                if (max > 9 && max < 13) {
                    user[token].bort = 1;
                } else {
                    user[token].bort = getRandomInt(2);
                }
            } else {
                user[token].bort = getRandomInt(2);
            }
            var raisePrice = getPriceCases(user[token].pairAmount, response1.cases);
            var total = user[token].amount + raisePrice;
            var msg = "";
            if (user[token].pairAmount > 0) {
                if (response1.cases == 1) {
                    msg = "";
                } else {
                    msg = response1.msg + " : +" + raisePrice;
                }
            } else {
                msg = "";
            }
            // try {
            //     await axios.post(
            //         process.env.PLATFORM_SERVER + "api/games/bet",
            //         {
            //             token: user[token].userToken,
            //             amount: user[token].antoAmount + user[token].pairAmount,
            //         }
            //     );
            // } catch (err) {
            //     throw new Error("Bet Error!");
            // }
            // if (raisePrice > 0) {
            //     try {
            //         await axios.post(
            //             process.env.PLATFORM_SERVER + "api/games/winlose",
            //             {
            //                 token: user[token].userToken,
            //                 amount: raisePrice,
            //                 winState: raisePrice != 0 ? true : false,
            //             }
            //         )
            //     } catch (err) {
            //         throw new Error("WinLose Error!");
            //     }
            // }
            try {
                res.json({
                    msg: msg,
                    activeArray: response1.activeArray,
                    total: total,
                    serverMsg: "Success"
                })
            } catch (error) {
                throw new Error("Can't find Server!");
            };
        } catch (err) {
            res.json({
                serverMsg: err.message
            })
        }
    },
    ResultHoldem: async (req, res) => {
        const { userName, betAmount, token, amount } = req.body;
        var betValue = parseFloat(betAmount);
        var amountValue = parseFloat(amount);
        user[token].betAmount = betValue;
        user[token].amount = amountValue;
        try {
            var raisePrice;
            var msg = "";
            var active_array = [];
            var gameResult = "";
            if (user[token].bort == 1) {
                var UserCardArray = [];
                var BortCardArray = [];
                for (var i = 0; i < 6; i++) {
                    if (i >= 0 && i <= 2) {
                        UserCardArray.push(user[token].cardArray[i]);
                    } else {
                        BortCardArray.push(user[token].cardArray[i])
                    }
                }
                var resultResponse = ResultCheck(UserCardArray, BortCardArray);
                if (resultResponse.msg == "winBort") {
                    raisePrice = 0;
                    msg = "Better luck next time!";
                } else if (resultResponse.msg == "winUser") {
                    if (resultResponse.cases == 7) {
                        raisePrice = 10 * user[token].betAmount;
                    } else if (resultResponse.cases == 6) {
                        raisePrice = 8 * user[token].betAmount;
                    } else if (resultResponse.cases == 5) {
                        raisePrice = 6 * user[token].betAmount;
                    } else {
                        raisePrice = 4 * user[token].betAmount;
                    }
                    msg = "You win : " + "+" + raisePrice;
                } else {
                    raisePrice = 2 * user[token].betAmount;
                    msg = "TIE : ↻" + raisePrice;
                }
                active_array = resultResponse.active_array;
                gameResult = resultResponse.msg;
            } else {
                raisePrice = 3 * user[token].betAmount;
                msg = "Fold : " + "+" + raisePrice;
                gameResult = "winUser";
                active_array = [];
            }
            var total = user[token].amount + raisePrice;
            // try {
            //     await axios.post(
            //         process.env.PLATFORM_SERVER + "api/games/bet",
            //         {
            //             token: user[token].userToken,
            //             amount: user[token].betAmount,
            //         }
            //     );
            // } catch (err) {
            //     throw new Error("Bet Error!");
            // }
            // if (raisePrice > 0) {
            //     try {
            //         await axios.post(
            //             process.env.PLATFORM_SERVER + "api/games/winlose",
            //             {
            //                 token: user[token].userToken,
            //                 amount: raisePrice,
            //                 winState: raisePrice != 0 ? true : false,
            //             }
            //         )
            //     } catch (err) {
            //         throw new Error("WinLose Error!");
            //     }
            // }
            try {
                res.json({
                    msg: msg,
                    activeArray: active_array,
                    total: total,
                    gameResult: gameResult,
                    raisePrice: raisePrice,
                    serverMsg: "Success"
                })
            } catch (error) {
                throw new Error("Can't find Server!");
            };
        } catch (err) {
            res.json({
                serverMsg: err.message
            })
        }
    },
};