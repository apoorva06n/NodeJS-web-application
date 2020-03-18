import { Component, ViewEncapsulation, Inject, Injectable } from '@angular/core';
import { FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as CanvasJS from '../assets/canvasjs.min';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})

@Injectable()
export class AppComponent {
  title = 'weather-forecast';
  curr_lat = '';
  curr_lon = '';
  curr_city = '';
  curr_state = '';
  curr_street = '';
  show_progressbar = false;
  show_results = true;
  error_occured = false;
  is_curr_fav = false;
  public weather_details;
  stateSealImageLink = '';
  city_options = [];
  favorites_list = [];
  constructor(private http: HttpClient, public dialog: MatDialog) {}
  public barChartOptions = {
                            scaleShowVerticalLines: false,
                            responsive: true,
                            legend: { onClick: null },
                            scales: {
                                yAxes: [{ scaleLabel: { display: true,labelString: 'Farenheit'},ticks:{suggestedMax:10,suggestedMin:0}}],
                                xAxes: [{ scaleLabel: { display: true, labelString: 'Time difference from current hour'}}]}
                          };
  public barChartLabels = ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
  public barChartData = [{ data: [],label: '', backgroundColor: '#7de3fa', borderColor: '#7de3fa', hoverBackgroundColor: '#0578ad'}];
  public barChartType = 'bar';
  public barChartLegend = true;

  searchForm = new FormGroup({
	    street : new FormControl('', { validators: Validators.required, updateOn: 'blur' }),
	    city : new FormControl('', { validators: Validators.required, updateOn: 'blur' }),
	    state : new FormControl('',[<any>Validators.required]),
	    curr_loc : new FormControl()
	});

  onFormSubmit(): void {
    this.show_progressbar = true;
    this.error_occured = false;
    this.is_curr_fav = false;
  	if(this.searchForm.get('curr_loc').value)
  	{
  		this.getCurrentLoc();
  	}
  	else
  	{
      this.curr_city = this.searchForm.get('city').value;
      this.curr_state = this.searchForm.get('state').value;
  		this.getLatitude(this.searchForm.get('street').value,this.searchForm.get('city').value,this.searchForm.get('state').value);
  	}
  };
  getLatitude(street,city,state){
    this.curr_city = city
    this.http.get('https://apoorva06nodehw.azurewebsites.net/getLatLong?street='+street+'&city='+city+'&state='+state,{responseType: 'text'}).subscribe(data => {
      if(data == 'address not found'){
      	this.error_occured = true;
      	this.show_progressbar = false;
      }
      else{
      	const res = JSON.parse(data);
      	if(res.results.length == 0){
      		this.error_occured = true;
      		this.show_progressbar = false;
      	}
      	else{
      	  this.curr_lat = res.results[0].geometry.location.lat;
	      this.curr_lon = res.results[0].geometry.location.lng;
	      this.getWeather(this.curr_lat,this.curr_lon,this.curr_state);
      	}
      }
    });
  };
  getCurrentLoc(){
  	this.http.get('http://ip-api.com/json',{responseType: 'text'}).subscribe(data => {
      const res = JSON.parse(data);
      this.curr_lat = res['lat'];
      this.curr_lon = res['lon'];
      this.curr_city = res['city'];
      this.curr_state = res['region'];
      this.getWeather(this.curr_lat,this.curr_lon,this.curr_state);
    });
  };
  getWeatherFromFav(latitude,longitude,city,state){
  	this.curr_city = city
  	this.getWeather(latitude,longitude,state);
  	this.curr_lat = latitude;
    this.curr_lon = longitude;
  };
  getWeather(latitude,longitude,state){
    this.show_progressbar = true;
    this.weather_details = {};
    this.http.get('https://apoorva06nodehw.azurewebsites.net/getWeather?lat='+latitude+'&lon='+longitude,{responseType: 'text'}).subscribe(data => {
      if(data == 'Latitude and longiture not found'){
        this.error_occured = true;
        this.show_progressbar = false;
      }
      else
      {	
      	const res = JSON.parse(data);
      	if(res.hasOwnProperty('error')){
      		this.error_occured = true;
      		this.show_progressbar = false;
      	}
      	else{
      		this.weather_details = res;
      		this.getStateSeal(state);
      	}
      }
   });
   if(localStorage.getItem(latitude+","+longitude)){
   	this.is_curr_fav = true;
   }
   else{
   	this.is_curr_fav = false;
   }
  };
  getStateSeal(state){
  	this.http.get('https://apoorva06nodehw.azurewebsites.net/getStateSeal?state='+state,{responseType: 'text'}).subscribe(data => {
      const res = JSON.parse(data);
      if(res.items.length > 0){
      	this.stateSealImageLink = res.items[0]['link'];
      }
      this.show_progressbar = false;
	  this.show_results = true;
    });
  };
  getAutoCompleteCities(val){
    this.http.get('https://apoorva06nodehw.azurewebsites.net/autoComplete?input='+val,{responseType: 'text'}).subscribe(data => {
      const res = JSON.parse(data);
      if (res.predictions.length > 0){
        var options = [];
        for (var i = 0; i < Math.min(5,res.predictions.length); i++)
        {
          options.push(res.predictions[i].structured_formatting.main_text);
        }
        this.city_options = options;
      }
      else{
        this.city_options = [];
      }
    });
  };
  onForecastChartValueChange(selected_val){
    this.barChartData[0]['data'] = [];
    this.barChartData[0].label = selected_val;
    switch(selected_val){
      case "temperature": for (var i = 0; i < 24; i++)
                          {
                          	this.barChartData[0].data.push(Math.round(this.weather_details.hourly.data[i][selected_val]));
                          }
                          var max_tick_val = Math.max.apply(Math, this.barChartData[0].data);
                          var min_tick_val = Math.min.apply(Math, this.barChartData[0].data);
                          this.barChartOptions = {
                            scaleShowVerticalLines: false,
                            responsive: true,
                            legend: { onClick: null },
                            scales: {
                                yAxes: [{ scaleLabel: {display: true,labelString: 'Farenheit'},ticks:{suggestedMax: max_tick_val+2, suggestedMin: min_tick_val-2}}],
                                xAxes: [{ scaleLabel: { display: true, labelString: 'Time difference from current hour'}}]}
                          };
                          break;
      case "pressure":for (var i = 0; i < 24; i++)
                      {
                      	this.barChartData[0].data.push(this.weather_details.hourly.data[i][selected_val]);
                      }
                      var max_tick_val = Math.max.apply(Math, this.barChartData[0].data);
                      var min_tick_val = Math.min.apply(Math, this.barChartData[0].data);
                      this.barChartOptions = {
                        scaleShowVerticalLines: false,
                        responsive: true,
                        legend: { onClick: null },
                        scales: {
                            yAxes: [{ scaleLabel: {display: true,labelString: 'Millibars'},ticks:{suggestedMax: Math.round(max_tick_val)+2, suggestedMin: Math.round(min_tick_val)-2}}],
                            xAxes: [{ scaleLabel: { display: true, labelString: 'Time difference from current hour'}}]}
                      };
                      break;
      case "humidity":for (var i = 0; i < 24; i++)
                      {
                      	this.barChartData[0].data.push(this.weather_details.hourly.data[i][selected_val]*100);
                      }
                      var max_tick_val = Math.max.apply(Math, this.barChartData[0].data);
                      var min_tick_val = Math.min.apply(Math, this.barChartData[0].data);
                 	  this.barChartOptions = {
                        scaleShowVerticalLines: false,
                        responsive: true,
                        legend: { onClick: null },
                        scales: {
                            yAxes: [{ scaleLabel: {display: true,labelString: '% Humidity'},ticks:{suggestedMax: Math.round(max_tick_val)+2, suggestedMin: Math.round(min_tick_val)-2}}],
                            xAxes: [{ scaleLabel: { display: true, labelString: 'Time difference from current hour'}}]}
                      };
                      break;
      case "ozone": for (var i = 0; i < 24; i++)
                     {
                     	this.barChartData[0].data.push(this.weather_details.hourly.data[i][selected_val]);
                     }
                     var max_tick_val = Math.max.apply(Math, this.barChartData[0].data);
                     var min_tick_val = Math.min.apply(Math, this.barChartData[0].data);
                     this.barChartOptions = {
                      scaleShowVerticalLines: false,
                      responsive: true,
                      legend: { onClick: null },
                      scales: {
                         yAxes: [{ scaleLabel: {display: true,labelString: 'Dobson Units'},ticks:{suggestedMax: Math.round(max_tick_val)+2, suggestedMin: Math.round(min_tick_val)-2}}],
                         xAxes: [{ scaleLabel: { display: true, labelString: 'Time difference from current hour'}}]}
                     };
                     break;
      case "visibility": for (var i = 0; i < 24; i++)
                         {
                         	this.barChartData[0].data.push(this.weather_details.hourly.data[i][selected_val]);
                         }
                         var max_tick_val = Math.max.apply(Math, this.barChartData[0].data);
                         var min_tick_val = Math.min.apply(Math, this.barChartData[0].data);
                         this.barChartOptions = {
                            scaleShowVerticalLines: false,
                            responsive: true,
                            legend: { onClick: null },
                            scales: {
                                yAxes: [{ scaleLabel: {display: true,labelString: 'Miles (Maximum 10)'},ticks:{suggestedMax:Math.round(max_tick_val)+1, suggestedMin: Math.round(min_tick_val)-1}}],
                                xAxes: [{ scaleLabel: { display: true, labelString: 'Time difference from current hour'}}]}
                          };
                         break;
      default:for (var i = 0; i < 24; i++)
              {
              	this.barChartData[0].data.push(this.weather_details.hourly.data[i][selected_val]);
              }
              var max_tick_val = Math.max.apply(Math, this.barChartData[0].data);
              var min_tick_val = Math.min.apply(Math, this.barChartData[0].data);
         	  this.barChartOptions = {
                scaleShowVerticalLines: false,
                responsive: true,
                legend: { onClick: null },
                scales: {
                    yAxes: [{ scaleLabel: {display: true,labelString: 'Miles per Hour'},ticks:{suggestedMax:Math.round(max_tick_val)+1,suggestedMin: Math.round(min_tick_val)-1}}],
                    xAxes: [{ scaleLabel: { display: true, labelString: 'Time difference from current hour'}}]}
              };
              break;
    }
  };
  renderRangeChart(lat,lon){
      var data = [];
      var x_a = 6;
      for (var i = 0; i < 7; i++)
      {
        data.push({x: x_a*10, y:[Math.round(this.weather_details.daily.data[i].temperatureLow), Math.round(this.weather_details.daily.data[i].temperatureHigh)], z: this.weather_details.daily.data[i]['time'],label: new Date((this.weather_details.daily.data[i]['time']*1000)+(this.weather_details['offset']*3600000)).toLocaleDateString()});
        x_a--;
      }
      let chart = new CanvasJS.Chart("chartContainer", {
      animationEnabled: true,
      exportEnabled: false,
      title: {
        text: "Weekly Weather"
      },
      axisX: {
        title: "Days"
      },
      axisY: {
        includeZero: false,
        title: "Temperature in Fahrenheit",
        interval: 10,
        gridThickness: 0,
      }, 
      legend: {
       horizontalAlign: "center", 
       verticalAlign: "top", 
       fontSize: 15
      },
      data: [{
        type: "rangeBar",
        showInLegend: true,
        indexLabel: "{y[#index]}",
        color: '#7de3fa',
        legendText: "Day wise temperature range",
        toolTipContent: "<b>{label}</b>: {y[0]} to {y[1]}",
        dataPoints:data,
        click: (this.show_weather_dialog).bind(this)
      }]
    });
    chart.render();
  };
  ontabClick(event){
    if(event.tab.textLabel == 'Hourly'){
      this.onForecastChartValueChange('temperature');
    }
    else if(event.tab.textLabel == 'Weekly'){
      this.renderRangeChart(this.curr_lat,this.curr_lon);
    }
  }
  openTwitter(){
    var url = 'https://twitter.com/intent/tweet?text=The%20current%20temperature%20at%20'+this.curr_city+'%20is%20'+Math.round(this.weather_details.currently.temperature)+'%C2%B0%20F.%20The%20weather%20conditions%20are%20'+this.weather_details.currently.summary+'.%20%23CSCI571WeatherSearch';
    window.open(url)
  }
  addFavorites(){
  	if(localStorage.getItem(this.curr_lat+","+this.curr_lon)){
  		this.deleteFavorites(this.curr_lat+","+this.curr_lon);
  		this.is_curr_fav = false;
  	}
  	else{
	  	this.is_curr_fav = true;
	    let myObj = { lat:this.curr_lat, lon:this.curr_lon, imglink:this.stateSealImageLink, city:this.curr_city, state:this.curr_state };
	    localStorage.setItem(this.curr_lat+","+this.curr_lon, JSON.stringify(myObj));
  	}
  }
  deleteFavorites(key){
    localStorage.removeItem(key);
    this.favorites_list = [];
    for (let i = 0; i < localStorage.length; i++)
    {
      let value = localStorage.getItem(localStorage.key(i));
      this.favorites_list.push(JSON.parse(value));
    }
  }
  show_weather_dialog(e){
    this.http.get('https://apoorva06nodehw.azurewebsites.net/getWeatherbyTime?lat='+this.curr_lat+'&lon='+this.curr_lon+'&time='+e.dataPoint.z,{responseType: 'text'}).subscribe(data => {
      const res = JSON.parse(data);
      var icon_url = '';
      switch(res.currently.icon){
        case "clear-day":
        case "clear-night":
                icon_url="https://cdn3.iconfinder.com/data/icons/weather-344/142/sun-512.png";
                break;
        case "rain": icon_url="https://cdn3.iconfinder.com/data/icons/weather-344/142/rain-512.png";
                break;
        case "snow": icon_url="https://cdn3.iconfinder.com/data/icons/weather-344/142/snow-512.png";
                break;
        case "sleet": icon_url="https://cdn3.iconfinder.com/data/icons/weather-344/142/lightning-512.png";
                break;
        case "wind": icon_url="https://cdn4.iconfinder.com/data/icons/the-weather-is-nice-today/64/weather_10-512.png";
                break;
        case "fog": icon_url="https://cdn3.iconfinder.com/data/icons/weather-344/142/cloudy-512.png";
                break;
        case "cloudy": icon_url="https://cdn3.iconfinder.com/data/icons/weather-344/142/cloud-512.png";
                break;
        default: icon_url="https://cdn3.iconfinder.com/data/icons/weather-344/142/sunny-512.png";
                break;
      }
      this.dialog.open(weatherdialog,{ width: '360px',data: {date: e.dataPoint.label,city: this.curr_city,temperature: Math.round(res.currently.temperature) , iconurl: icon_url, summary:res.currently.summary, precipitation: res.currently.precipIntensity.toFixed(2) == 0 ? 0:res.currently.precipIntensity.toFixed(2),precip_prob:Math.round(res.currently.precipProbability*100),windSpeed: res.currently.windSpeed, humidity: Math.round(res.currently.humidity*100), visibility: res.currently.visibility}, position:{top:'1%'}});
    });
  }
  show_result(){
  	this.error_occured = false;
    this.show_results = true;
  }
  show_favorite(){
  	this.error_occured = false;
    this.favorites_list = [];
    this.show_results = false;
    for (let i = 0; i < localStorage.length; i++){
      let value = localStorage.getItem(localStorage.key(i));
      this.favorites_list.push(JSON.parse(value));
    }
  }
  clear_form(){
  	location.reload();
  }
 }

@Component({
  selector: 'app-root-dialog',
  templateUrl: 'weather-dialog.html',
})

export class weatherdialog {

  constructor(
    public dialogRef: MatDialogRef<weatherdialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onClickClose(): void {
    this.dialogRef.close();
  }

}