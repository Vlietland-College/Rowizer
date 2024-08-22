//from https://stackoverflow.com/a/6117889/2343584

Date.prototype.getWeekNumber = function(){
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};

Date.prototype.getSchoolYear = function(){
    return this.getMonth() < 7 ? this.getFullYear() - 1 : this.getFullYear()
};

Date.prototype.getStartOfDayTime = function(){
    let date = new Date(this.getTime())
    date.setHours(0,0,0,0)
    return date.getTime()
};

Date.prototype.getEndOfDayTime = function(){
    let date = new Date(this.getTime())
    date.setHours(23,59,59)
    return date.getTime()
};
