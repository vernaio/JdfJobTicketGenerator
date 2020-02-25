function retrieveFullSheetConfig(gangJobEvent) {
  let frontPage = {
    coloruUses: {
      colorUse: []
    },
    groups: { group: [] }
  }
  for (let color of gangJobEvent.gangJob.form.frontPage.colors.color) {
    frontPage.coloruUses.colorUse.push({ "color": color, intensity: 50 });
  }
  let backPage = {
    coloruUses: {
      colorUse: []
    },
    groups: { group: [] }
  }
  for (let color of gangJobEvent.gangJob.form.backPage.colors.color) {
    backPage.coloruUses.colorUse.push({ "color": color, intensity: 50 });
  }
  return { frontPage, backPage };
}
/*
  createdOn is converted to a string like : 2019-01-19T00:04:27Z
*/
function apogeeFormatedDateFromUTC(utcMillisecondTimeStamp) {
  var createdOn = new Date(utcMillisecondTimeStamp);
  var YYYY = createdOn.getUTCFullYear();
  var MM = createdOn.getUTCMonth() + 1;
  if (MM < 10) {
    MM = "0" + MM;
  };
  var DD = createdOn.getUTCDate();
  if (DD < 10) {
    DD = "0" + DD;
  };
  var hh = createdOn.getUTCHours();
  if (hh < 10) {
    hh = "0" + hh;
  };
  var mm = createdOn.getUTCMinutes();
  if (mm < 10) {
    mm = "0" + mm;
  };
  var ss = createdOn.getUTCSeconds();
  if (ss < 10) {
    ss = "0" + ss;
  };
  return YYYY + "-" + MM + "-" + DD + "T" + hh + ":" + mm + ":" + ss + "Z";
}

function apogeeWorkstyleFromDtoWorkStyle(dtoWorkStyle) {
  return "Perfecting";
}

function microMeterToPoints(dimension) {
  return dimension*72/25400;
}

class JdfData {

  constructor(sheetId, gangJobEvent, sheetBleed) {
    this.gangJobEvent = gangJobEvent;
    this.injection = {};
    this.injection['pib.sheet.id'] = sheetId;
    this.injection['pib.sheet.amount'] = this.gangJobEvent.gangJob.quantity,
    this.injection['apogee.sheet.format.width'] = microMeterToPoints(this.gangJobEvent.gangJob.media.format.width);
    this.injection['apogee.sheet.format.height'] = microMeterToPoints(this.gangJobEvent.gangJob.media.format.height);
    this.injection['apogee.artwork.location'] = sheetId + ".pdf";
    this.injection['apogee.sheet.pageCount'] = (this.gangJobEvent.gangJob.workStyle === "SIMPLEX") ? 1 : 2;
    this.injection['apogee.sheet.bleed'] = microMeterToPoints(sheetBleed);
    this.injection['pib.user'] = this.gangJobEvent.auditLog.createdBy.split("@")[0];
    this.injection['pib.sheet.createdOn'] = apogeeFormatedDateFromUTC(this.gangJobEvent.auditLog.createdOn);
    this.injection['pib.sheet.weight'] = this.gangJobEvent.gangJob.media.weight;
    this.injection['pib.sheet.thickness'] = this.gangJobEvent.gangJob.media.thickness;
    this.injection['apogee.job.workStyle'] = apogeeWorkstyleFromDtoWorkStyle(this.gangJobEvent.gangJob.workStyle);
    this.injection['apogee.sheet.absoluteFormat.width'] = this.injection['apogee.sheet.format.width']+2*this.injection['apogee.sheet.bleed'];
    this.injection['apogee.sheet.absoluteFormat.height'] = this.injection['apogee.sheet.format.height']+2*this.injection['apogee.sheet.bleed'];
    this.injection['pib.sheet.device.id'] = this.gangJobEvent.gangJob.printingDevice.id;
    this.injection['pib.sheet.device.label'] = this.gangJobEvent.gangJob.printingDevice.label;
    this.injection['apogee.media.grainDirection'] = this.gangJobEvent.gangJob.media.grainDirection+"Direction";
  }

  replace(lineArray) {
    var result = [];
    for (let line of lineArray) {
      var currentLine = line;
      for (let key of Object.keys(this.injection)) {
        let regex = new RegExp("INJECT[(]" + key + "[)]", "g");
        if (currentLine.match(regex)) {
          var value = this.injection[key];
          currentLine = currentLine.replace(regex, value);
        }
      }
      result.push(currentLine);
    }
    return result;
  }

  createJdf(lineArray) {
    var newLineArray = this.replace(lineArray);
    return newLineArray.join("\n");
  }
}

function writeApogeeJdf(sheetId, gangJobEvent, sheetBleed, lineArray) {
  var jdfData = new JdfData(sheetId, gangJobEvent, sheetBleed);
  return jdfData.createJdf(lineArray);
}

module.exports = {
  "writeApogeeJdf": writeApogeeJdf
}
