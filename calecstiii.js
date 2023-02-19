if (msg && msg.data) {
    var data = Decoder(msg.data, msg.port);

    msg.mainenergyunit = data.mainenergyunit;
    msg.heatMeterEnergy = data.mainenergy;
    msg.flowRate = data.flow;
    msg.flowTemperature = data.tempflow;
    msg.returnFlowTemperature = data.tempreturn;
    msg.datetime = data.datetime;
    msg.sn = data.sn;
 
}

return {
    msg: msg,
    metadata: metadata,
    msgType: msgType
};

// payload data ->  {
//   mainenergyunit: '0.001 MWh',
//   mainenergy: 5389,
//   flow: 10891.87,
//   tempflow: 52.4,
//   tempreturn: 25,
//   datetime: '13-01-23 10:16',
//   sn: '5911854'
// }



function Decoder(byte, port) {
    var byte = byte.replaceAll(' ', '')
    var byteArr = []
    for (var i = 0; i < byte.length; i += 2) {
        byteArr.push(byte[i] + "" + byte[i + 1])
        // byteArr.push(`${byte[i]}${byte[i+1]}`)

    }
    //   byte = byteArr.map(res => Number('0x' +res));

    for (var i = 0; i < byteArr.length; i++) byteArr[i] =
        Number('0x' + byteArr[i]);
    byte = byteArr;

    var SET = 2; //SET 1-7

    //var B = input.bytes; //Payload bytes
    //var P = input.fPort; //FPort

    if (port == 2) {

        var return_data; //Return data
        var offset = 0;
        var payload_len = byte[0]; //Payload length
        var sec_addr = byte[4].toString(16) + byte[5]
            .toString(16) + byte[6].toString(16) + byte[7]
            .toString(16); //Secondary address of calculator
        var dev_version = byte[8]; //Device type
        var ci_field = Math.abs(byte[10]).toString(
            16) //Short Header 
        if (SET == 1 || payload_len == 32 || payload_len ==
            33) { //SET 1

            offset = getOffsetEnergy(byte[15]);

            var main_energy_u = energyUnit(byte[
            16]); //Energy unit;

            if (offset == 1) {
                main_energy_u = energyUnit(byte[15] << 8 |
                    byte[16]); //Energy unit;
            }

            var main_energy = (byte[20 + offset] & 0x80 ?
                    0xFFFF << 24 : 0) | byte[20 + offset] <<
                24 | byte[19 + offset] << 16 | byte[18 +
                    offset] << 8 | byte[17 +
                offset]; //Main Energy
            var date_time = fToDateTime(byte[26 + offset],
                byte[25 + offset], byte[24 + offset],
                byte[23 + offset]); //TimeStamp
            var fab_nr = Math.abs(byte[32 + offset])
                .toString(16) + Math.abs(byte[31 + offset])
                .toString(16) + Math.abs(byte[30 + offset])
                .toString(16) + Math.abs(byte[29 + offset])
                .toString(16); //Fabrication number

            return_data = {
                mainenergyunit: main_energy_u,
                mainenergy: main_energy,
                datetime: date_time,
                sn: fab_nr,
            }
        } else if (SET == 2) { //SET 2

            offset = getOffsetEnergy(byte[15]);
            var main_energy_u = energyUnit(byte[
            16]); //Energy unit;
            if (offset == 1) {
                main_energy_u = energyUnit(byte[15] << 8 |
                    byte[16]); //Energy unit;
            }

            var main_energy = (byte[20 + offset] & 0x80 ?
                    0xFFFF << 24 : 0) | byte[20 + offset] <<
                24 | byte[19 + offset] << 16 | byte[18 +
                    offset] << 8 | byte[17 +
                offset]; //Main energy
            var current_flow = bytesToFloat(byte[26 +
                offset], byte[25 + offset], byte[
                24 + offset], byte[23 +
            offset]); //Flow (l/h)
            var temp_flow = bytesToFloat(byte[32 + offset],
                byte[31 + offset], byte[30 + offset],
                byte[29 + offset]
                ); // Flow temperature in celsius
            var temp_return = bytesToFloat(byte[38 +
                offset], byte[37 + offset], byte[36 +
                    offset], byte[35 + offset]
                ); // Return temperature in celsius
            var date_time = fToDateTime(byte[44 + offset],
                byte[43 + offset], byte[42 + offset],
                byte[41 + offset]); //TimeStamp
            var fab_nr = Math.abs(byte[50 + offset])
                .toString(16) + Math.abs(byte[49 + offset])
                .toString(16) + Math.abs(byte[48 + offset])
                .toString(16) + Math.abs(byte[47 + offset])
                .toString(16); //Fabrication number

            return_data = {
                mainenergyunit: main_energy_u,
                mainenergy: main_energy,
                flow: current_flow,
                tempflow: temp_flow,
                tempreturn: temp_return,
                datetime: date_time,
                sn: fab_nr
            }
        } else if (SET == 3) { //SET 3

            offset = getOffsetEnergy(byte[16]);
            var main_energy_u = energyUnit(byte[
            16]); //Energy unit;

            if (offset == 1) {
                main_energy_u = energyUnit(byte[16] << 8 |
                    byte[17]); //Energy unit;
            }

            var main_energy = (byte[20 + offset] & 0x80 ?
                    0xFFFF << 24 : 0) | byte[20 + offset] <<
                24 | byte[19 + offset] << 16 | byte[18 +
                    offset] << 8 | byte[17 +
                offset]; //Main energy

            var main_volume_u = volumeUnit(byte[22 +
                offset]);

            if (getOffsetVolume(byte[22 + offset]) == 1) {
                main_volume_u = volumeUnit(byte[23] << 8 |
                    byte[24]);
            }

            offset = getOffsetVolume(byte[22 + offset]) +
                offset;

            var main_volume = (byte[26 + offset] & 0x80 ?
                    0xFFFF << 24 : 0) | byte[26 + offset] <<
                24 | byte[25 + offset] << 16 | byte[24 +
                    offset] << 8 | byte[23 +
                offset]; //Main volume
            var current_flow = bytesToFloat(byte[32 +
                offset], byte[31 + offset], byte[
                30 + offset], byte[29 +
            offset]); //Flow (l/h)
            var date_time = fToDateTime(byte[38 + offset],
                byte[37 + offset], byte[36 + offset],
                byte[35 + offset]); //TimeStamp
            var fab_nr = Math.abs(byte[44 + offset])
                .toString(16) + Math.abs(byte[43 + offset])
                .toString(16) + Math.abs(byte[42 + offset])
                .toString(16) + Math.abs(byte[41 + offset])
                .toString(16); //Fabrication number

            return_data = {
                mainenergyunit: main_energy_u,
                mainenergy: main_energy,
                mainvolumeunit: main_volume_u,
                mainvolume: main_volume,
                flow: current_flow,
                datetime: date_time,
                sn: fab_nr
            }
        } else if (SET == 4) { //SET 4

            offset = getOffsetEnergy(byte[16]);
            var main_energy_u = energyUnit(byte[
            16]); //Energy unit;

            if (offset == 1) {
                main_energy_u = energyUnit(byte[16] << 8 |
                    byte[17]); //Energy unit;
            }

            var main_energy = (byte[20 + offset] & 0x80 ?
                    0xFFFF << 24 : 0) | byte[20 + offset] <<
                24 | byte[19 + offset] << 16 | byte[18 +
                    offset] << 8 | byte[17 +
                offset]; //Main energy

            var main_volume_u = volumeUnit(byte[22 +
                offset]); //Volume unit

            if (getOffsetVolume(byte[22 + offset]) == 1) {
                main_volume_u = volumeUnit(byte[22 +
                    offset] << 8 | byte[23 + offset]
                    ); //Volume Unit
            }

            offset = getOffsetVolume(byte[22 + offset]) +
                offset;

            var main_volume = (byte[26 + offset] & 0x80 ?
                    0xFFFF << 24 : 0) | byte[26 + offset] <<
                24 | byte[25 + offset] << 16 | byte[24 +
                    offset] << 8 | byte[23 +
                offset]; //Main volume
            var current_power = bytesToFloat(byte[32 +
                offset], byte[31 + offset], byte[
                30 + offset], byte[29 +
            offset]); //Power (W)
            var current_flow = bytesToFloat(byte[38 +
                offset], byte[37 + offset], byte[
                36 + offset], byte[35 +
            offset]); //Flow (l/h)
            var date_time = fToDateTime(byte[44 + offset],
                byte[43 + offset], byte[42 + offset],
                byte[41 + offset]); //TimeStamp
            var fab_nr = Math.abs(byte[50 + offset])
                .toString(16) + Math.abs(byte[49 + offset])
                .toString(16) + Math.abs(byte[48 + offset])
                .toString(16) + Math.abs(byte[47 + offset])
                .toString(16); //Fabrication number

            return_data = {
                mainenergyunit: main_energy_u,
                mainenergy: main_energy,
                mainvolumeunit: main_volume_u,
                mainvolume: main_volume,
                power: current_power,
                flow: current_flow,
                datetime: date_time,
                sn: fab_nr
            }
        } else if (SET == 5) { //SET 5

            offset = getOffsetEnergy(byte[16]);
            var main_energy_u = energyUnit(byte[
            16]); //Energy unit;

            if (offset == 1) {
                main_energy_u = energyUnit(byte[16] << 8 |
                    byte[17]); //Energy unit;
            }

            var main_energy = (byte[20 + offset] & 0x80 ?
                    0xFFFF << 24 : 0) | byte[20 + offset] <<
                24 | byte[19 + offset] << 16 | byte[18 +
                    offset] << 8 | byte[17 +
                offset]; //Main energy

            var main_volume_u = volumeUnit(byte[22 +
                offset]); //Volume unit

            if (getOffsetVolume(byte[22 + offset]) == 1) {
                main_volume_u = volumeUnit(byte[22 +
                    offset] << 8 | byte[23 + offset]
                    ); //Volume Unit
            }

            var current_flow = bytesToFloat(byte[26 +
                offset], byte[25 + offset], byte[
                24 + offset], byte[23 +
            offset]); //Flow (l/h)
            var temp_flow = bytesToFloat(byte[32 + offset],
                byte[31 + offset], byte[30 + offset],
                byte[29 + offset]
                ); // Flow temperature in celsius
            var temp_return = bytesToFloat(byte[38 +
                offset], byte[37 + offset], byte[36 +
                    offset], byte[35 + offset]
                ); // Return temperature in celsius
            var date_time = fToDateTime(byte[44 + offset],
                byte[43 + offset], byte[42 + offset],
                byte[41 + offset]); //TimeStamp
            var fab_nr = Math.abs(byte[50 + offset])
                .toString(16) + Math.abs(byte[49 + offset])
                .toString(16) + Math.abs(byte[48 + offset])
                .toString(16) + Math.abs(byte[47 + offset])
                .toString(16); //Fabrication number

            return_data = {
                mainenergyunit: main_energy_u,
                mainenergy: main_energy,
                flow: current_flow,
                tempflow: temp_flow,
                tempreturn: temp_return,
                datetime: date_time,
                sn: fab_nr
            }
        } else if (SET == 6) { //SET 6

            offset = getOffsetEnergy(byte[16]);
            var main_energy_u = energyUnit(byte[
            16]); //Energy unit;

            if (offset == 1) {
                main_energy_u = energyUnit(byte[16] << 8 |
                    byte[17]); //Energy unit;
            }

            var main_energy = (byte[20 + offset] & 0x80 ?
                    0xFFFF << 24 : 0) | byte[20 + offset] <<
                24 | byte[19 + offset] << 16 | byte[18 +
                    offset] << 8 | byte[17 +
                offset]; //Main energy
            var temp_flow = bytesToFloat(byte[26 + offset],
                byte[25 + offset], byte[24 + offset],
                byte[23 + offset]
                ); // Flow temperature in celsius
            var temp_return = bytesToFloat(byte[32 +
                offset], byte[31 + offset], byte[30 +
                    offset], byte[29 + offset]
                ); // Return temperature in celsius
            var date_time = fToDateTime(byte[38 + offset],
                byte[37 + offset], byte[36 + offset],
                byte[35 + offset]); //TimeStamp
            var fab_nr = Math.abs(byte[44 + offset])
                .toString(16) + Math.abs(byte[43 + offset])
                .toString(16) + Math.abs(byte[42 + offset])
                .toString(16) + Math.abs(byte[41 + offset])
                .toString(16); //Fabrication number

            return_data = {
                mainenergyunit: main_energy_u,
                mainenergy: main_energy,
                tempflow: temp_flow,
                tempreturn: temp_return,
                datetime: date_time,
                sn: fab_nr
            }
        } else if (SET == 7) { //SET 7

            offset = getOffsetEnergy(byte[16]);
            var main_energy_u = energyUnit(byte[
            16]); //Energy unit;

            if (offset == 1) {
                main_energy_u = energyUnit(byte[16] << 8 |
                    byte[17]); //Energy unit;
            }

            var main_energy = (byte[20 + offset] & 0x80 ?
                    0xFFFF << 24 : 0) | byte[20 + offset] <<
                24 | byte[19 + offset] << 16 | byte[18 +
                    offset] << 8 | byte[17 +
                offset]; //Main energy

            var main_volume_u = volumeUnit(byte[22 +
                offset]); //Volume unit

            if (getOffsetVolume(byte[22 + offset]) == 1) {
                main_volume_u = volumeUnit(byte[22 +
                    offset] << 8 | byte[23 + offset]
                    ); //Volume Unit
            }

            offset = getOffsetVolume(byte[22 + offset]) +
                offset;

            var main_volume = (byte[26 + offset] & 0x80 ?
                    0xFFFF << 24 : 0) | byte[26 + offset] <<
                24 | byte[25 + offset] << 16 | byte[24 +
                    offset] << 8 | byte[23 +
                offset]; //Main volume
            var current_power = bytesToFloat(byte[32 +
                offset], byte[31 + offset], byte[
                30 + offset], byte[29 +
            offset]); //Power (W)
            var current_flow = bytesToFloat(byte[38 +
                offset], byte[37 + offset], byte[
                36 + offset], byte[35 +
            offset]); //Flow (l/h)
            var temp_flow = bytesToFloat(byte[44 + offset],
                byte[43 + offset], byte[42 + offset],
                byte[41 + offset]
                ); // Flow temperature in celsius
            var temp_return = bytesToFloat(byte[50 +
                offset], byte[49 + offset], byte[48 +
                    offset], byte[47 + offset]
                ); // Return temperature in celsius
            var date_time = fToDateTime(byte[56 + offset],
                byte[55 + offset], byte[54 + offset],
                byte[53 + offset]); //TimeStamp
            var fab_nr = Math.abs(byte[62 + offset])
                .toString(16) + Math.abs(byte[61 + offset])
                .toString(16) + Math.abs(byte[60 + offset])
                .toString(16) + Math.abs(byte[59 + offset])
                .toString(16); //Fabrication number

            return_data = {
                mainenergyunit: main_energy_u,
                mainenergy: main_energy,
                mainvolumeunit: main_volume_u,
                mainvolume: main_volume,
                power: current_power,
                flow: current_flow,
                tempflow: temp_flow,
                tempreturn: temp_return,
                datetime: date_time,
                sn: fab_nr
            }
        } else {
            return_data = {
                error: "Dataset incorrect!"
            }
        }




    } else {
        return_data = {
            info: "LoRaWAN FPort is not 2!"
        }
    }
    return return_data;

}


function bytesToFloat(b0, b1, b2, b3) {
    var bits = (b0 << 24 | b1 << 16 | b2 << 8 | b3);
    var sign = ((bits >>> 31) == 0) ? 1.0 : -1.0;
    var e = ((bits >>> 23) & 0xff);
    var m = (e == 0) ? (bits & 0x7fffff) << 1 : (bits &
        0x7fffff) | 0x800000;
    var f = sign * m * Math.pow(2, e - 150);
    return Math.round(f * 100) / 100;
}

function fToDateTime(b0, b1, b2,
b3) { //Timestamp to datetime (d-m-y h:m)
    var day = "0" + (b1 & 0x1F);
    var mon = "0" + (b0 & 0x0F);
    var year = ((b1 & 0xE0) >> 5) | ((b0 & 0xF0) >> 1);
    var hour = "0" + (b2 & 0x1F);
    var min = "0" + (b3 & 0x3F);
    var datetime = day.substr(-2) + "-" + mon.substr(-2) +
        "-" + year + " " + hour.substr(-2) + ":" + min
        .substr(-2);
    return datetime;
}




function getOffsetEnergy(b) {

    var return_offset = 0;

    switch (b) {
        case 0xfb:
            return_offset = 1;
            break;
        case 0x80:
            return_offset = 1;
            break;
        case 0x81:
            return_offset = 1;
            break;
        case 0x82:
            return_offset = 1;
            break;
        case 0x83:
            return_offset = 1;
            break;
        case 0x84:
            return_offset = 1;
            break;
        case 0x85:
            return_offset = 1;
            break;
        case 0x86:
            return_offset = 1;
            break;
        default:
            return_offset = 0;
    }
    return return_offset;
}


function getOffsetVolume(b) {

    var return_offset = 0;

    switch (b) {
        case 0x90:
            return_offset = 1;
            break;
        case 0x91:
            return_offset = 1;
            break;
        case 0x92:
            return_offset = 1;
            break;
        case 0x93:
            return_offset = 1;
            break;
        default:
            return_offset = 0;
    }
    return return_offset;
}

function volumeUnit(b) {

    var return_unit = "";

    switch (b) {
        case 0x13: //10E-3_m3
            return_unit = "0.001 m3";
            break;
        case 0x14: //10E-2_m3
            return_unit = "0.01 m3";
            break;
        case 0x15: //10E-1_m3
            return_unit = "0.1 m3";
            break;
        case 0x16: //10E_0_m3
            return_unit = "1 m3";
            break;
        case 0x903d: //10E-3_USGAL
            return_unit = "0.001 USGAL";
            break;
        case 0x913d: //10E-2_USGAL
            return_unit = "0.01 USGAL";
            break;
        case 0x923d: //10E-1_USGAL
            return_unit = "0.1 USGAL";
            break;
        case 0x933d: //10E0_USGAL
            return_unit = "1 USGAL";
            break;
        default:
            return_unit = "error";
    }
    return return_unit;
}

function energyUnit(b) {

    var return_unit = "";

    switch (b) {
        case 0x03: //10E0_WH
            return_unit = "0.001 kWh";
            break;
        case 0x04: //10E1_WH
            return_unit = "0.01 kWh";
            break;
        case 0x05: //10E2_WH
            return_unit = "0.1 kWh";
            break;
        case 0x06: //10E3_WH
            return_unit = "1 kWh";
            break;
        case 0x07: //10E4_WH
            return_unit = "0.01 MWh";
            break;
        case 0xfb00: //10E-1_MWH
            return_unit = "0.1 MWh";
            break;
        case 0xfb01: //10E0_WH
            return_unit = "1 MWh";
            break;
        case 0x0b: //10E3_J
            return_unit = "0.001 MJ";
            break;
        case 0x0c: //10E4_J
            return_unit = "0.01 MJ";
            break;
        case 0x0d: //10E5_J
            return_unit = "0.1 MJ";
            break;
        case 0x0e: //10E6_J
            return_unit = "0.001 GJ";
            break;
        case 0x0f: //10E7_J
            return_unit = "0.01 GJ";
            break;
        case 0xfb08: //10E-1_GJ
            return_unit = "0.1 GJ";
            break;
        case 0xfb09: //10E0_GJ
            return_unit = "1 GJ";
            break;
        case 0x803d: //10E-3_kBTU
            return_unit = "0.001 kBTU";
            break;
        case 0x813d: //10E-2_kBTU
            return_unit = "0.01 kBTU";
            break;
        case 0x823d: //10E-1_kBTU
            return_unit = "0.1 kBTU";
            break;
        case 0x833d: //10E0_kBTU
            return_unit = "0.001 MBTU";
            break;
        case 0x843d: //10E1_kBTU
            return_unit = "0.01 MBTU";
            break;
        case 0x853d: //10E5_kBTU
            return_unit = "0.1 MBTU";
            break;
        case 0x863d: //10E6_kBTU
            return_unit = "1 MBTU";
            break;
        default:
            return_unit = "error";
    }
    return return_unit;
}
