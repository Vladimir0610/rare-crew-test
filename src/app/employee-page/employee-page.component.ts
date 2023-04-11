import { Component,ViewChild, ElementRef, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-employee-page',
  templateUrl: './employee-page.component.html',
  styleUrls: ['./employee-page.component.scss']
})
export class EmployeePageComponent implements OnInit {
  employeesProjects: any = [];
  usersDisplay: any[] = [];
  @ViewChild('myChart') myChart!: ElementRef;
  
  constructor(private apiService: ApiService) { }

  ngOnInit() {
    
    this.apiService.getEmployees().subscribe((data: any) => {  
      this.employeesProjects = data;
            
      this.employeesProjects.forEach((employee:any) => {
        if (!this.usersDisplay.includes(employee.EmployeeName)){
          if(employee.EmployeeName) {
            this.usersDisplay.push(employee.EmployeeName);
          }      
        }
      });

      this.createChart();   
    });
  }

  calculateTime(employeeName: string) {
    const totalHours = this.employeesProjects 
      .filter((employee:any) => employee.EmployeeName === employeeName)
      .reduce((total:any, employee:any) => total + (new Date(employee.EndTimeUtc).getTime()-new Date(employee.StarTimeUtc).getTime()) / 1000 / 60 / 60, 0)
     
    return totalHours;    
  }
 
  createChart() {
    const totalHours = this.usersDisplay.reduce((acc, employee) => acc + this.calculateTime(employee), 0);
    const data = {
      labels: this.usersDisplay,
      datasets: [{
        label: 'Percentage of Total Work Time',
        data: this.usersDisplay.map((employee:any) => Math.round((this.calculateTime(employee) / totalHours) * 100)),
        backgroundColor: this.getRandomColor(this.usersDisplay)
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
            formatter: (value: any) => {
                let percentage = value+"%";
                return percentage;
            },
            color: "#000000"
        }
    }
    };

    const ctx = this.myChart.nativeElement.getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: data,
      options: options,
      plugins: [ChartDataLabels]
    });
  }

  getRandomColor(data: any[]) {
    let colors: any[] = [];
    data.forEach(element => {  
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      colors.push(color)
    });
    return colors;
  }
  
}
