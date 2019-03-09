
function makeEmptyMatchData()
{
    /*
        Questions to ask. Does it matter to record whether they placed a hatch/cargo on
        rocket vs bay?
    */
   
    //Amount of recordings, 13
    var data = 
    {
        auto: {
         
            //Int
            hatchShip: {
                values: [],
                frequency: [],
            },
            cargoShip: {
                values: [],
                frequency: [],
            },
            hatchRocket: {
                values: [],
                frequency: [],
            },
            cargoRocket: {
                values: [],
                frequency: [],
            },
          
               //boolean value
            startsOnTwo: {
                values: [],
                frequency: [],
            },
            usesCamera: {
                values: [],
                frequency: [],
            },
            crossLine: {
                values: [],
                frequency: [],
            },
            dead:{
                values: [],
                frequency: [],
            },
        },

        teleop: {
            hatchShip: {
                values: [],
                frequency: [],
            },
            hatchRocket: {
                top: {
                    values: [],
                    frequency: [],
                },
                mid: {
                    values: [],
                    frequency: [],
                },
                bottom: {
                    values: [],
                    frequency: [],
                }
            },
            cargoShip: {
                values: [],
                frequency: [],
            },
            cargoRocket: {
                top: {
                    values: [],
                    frequency: [],
                },
                mid: {
                    values: [],
                    frequency: [],
                },
                bottom: {
                    values: [],
                    frequency: [],
                }
            },
            groundHatchPickup: {
                values: [],
                frequency: [],
            },
            humanHatchPickup: {
                values: [],
                frequency: [],
            },
            climbLevel: {
                values: [],
                frequency: [],
            },
            tippedOver: {
                values: [],
                frequency: [],
            },
            dead: {
                values: [],
                frequency: [],
            },
        }
    }

    return data;
}




function convertToRecordableData(data)
{
   // console.log("Data: " + JSON.stringify(data));
    for(j in data)
    {
        if(j == "values")
        {
            data = new Record(data.values, data.frequency);
            return data;
        }
        else
            data[j] = convertToRecordableData(data[j]);
    }
    return data;
}


function recordData(data, newData)
{
    recordData(data, newData, 0);
}

function recordData(data, newData, i)
{
    for(j in data)
    {
        if(j == "values")       
        {
            data.addValue(newData[i]);
            return i + 1;
        } 
        else
        {
            i = recordData(data[j], newData, i);
        }
    }
    return i;
}

function convertToSendableData(data)
{
    for (j in data) {
        if (j == "values") {
            data = {
                values : data.values,
                frequency : data.frequency
            }
            return data;
        }
        else
            data[j] = convertToSendableData(data[j]);
    }
    return data;
}

class Record
{
    constructor(values, frequency)
    {
        this.values = values;
        this.frequency = frequency;
    }

    addValue(data) {
        if (this.values.includes(data))
            this.frequency[this.values.indexOf(data)]++;
        else {
            this.values.push(data);
            this.frequency.push(1);
        }
    }
 

    getValue() {
        return this.values[this.indexOfMax()];
    }

    indexOfMax() {
    if (this.frequency.length === 0) {
        return -1;
    }

    var max = this.frequency[0];
    var maxIndex = 0;

    for (var i = 1; i < this.frequency.length; i++) {
        if (this.frequency[i] > max) {
            maxIndex = i;
            max = this.frequency[i];
            }
        }
    return maxIndex;

    }

}


class RecordData
{
    constructor(){
        this.value = [];
        this.frequency = [];
    }
    addValue(value)
    {
        if (value.includes(data))
            frequency[value.indexOf(data)]++;
        else {
            value.push(data);
            frequency.push(1);
        } 
    }
    getValue()
    {
        return value[this.indexOfMax];
    }

   indexOfMax() 
   {
        if (frequency.length === 0) {
            return -1;
        }

        var max = frequency[0];
        var maxIndex = 0;

        for (var i = 1; i < frequency.length; i++) {
           if (frequency[i] > max) {
            maxIndex = i;
            max = frequency[i];
            }
        }
    return maxIndex;
    }
}