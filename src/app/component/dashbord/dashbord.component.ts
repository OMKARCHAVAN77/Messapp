import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RatingViewsChartService } from '../../Shared/Services/rating-views-chart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashbord',
  templateUrl: './dashbord.component.html',
  styleUrl: './dashbord.component.css'
})
export class DashbordComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private ratingViewChartServ: RatingViewsChartService,
    private router: Router
  ) {}

  viewCount = 0;
  loading = true;
  isLoading = false;
  totalRatings = 0;
  averageRating = 0;
  globalRatingsCount = 0;
  selectedPeriod = 'daily';
  timePeriods = ['daily', 'weekly', 'monthly', 'yearly'];

  ratings = [
    { stars: '5 Star', percentage: 0 },
    { stars: '4 Star', percentage: 0 },
    { stars: '3 Star', percentage: 0 },
    { stars: '2 Star', percentage: 0 },
    { stars: '1 Star', percentage: 0 },
  ];

  ngOnInit() {
    this.viewDetails();
    this.ratingDetails();
    this.changeTimePeriod(this.selectedPeriod);
  }

  // ✅ Ratings — show empty state on 400
  ratingDetails() {
    this.ratingViewChartServ.getRatingDetailsList().subscribe({
      next: (data: any) => {
        if (data?.data && data.data.length > 0) {
          this.processRatings(data.data);
        } else {
          this.resetRatings(); // ✅ empty state
        }
      },
      error: (err) => {
        console.error('Error fetching ratings', err);
        this.resetRatings(); // ✅ don't crash — show empty
      }
    });
  }

  // ✅ Reset ratings to empty state
  resetRatings() {
    this.ratings = [
      { stars: '5 Star', percentage: 0 },
      { stars: '4 Star', percentage: 0 },
      { stars: '3 Star', percentage: 0 },
      { stars: '2 Star', percentage: 0 },
      { stars: '1 Star', percentage: 0 },
    ];
    this.averageRating = 0;
    this.globalRatingsCount = 0;
  }

  processRatings(ratingsData: any[]) {
    const validRatings = ratingsData.filter(
      (r) => r.rating > 0 && r.rating <= 5
    );
    this.globalRatingsCount = validRatings.length;
    if (this.globalRatingsCount === 0) return;

    const ratingCounts = [0, 0, 0, 0, 0];
    validRatings.forEach((rating) => {
      const starIndex = Math.floor(rating.rating);
      if (starIndex >= 1 && starIndex <= 5) {
        ratingCounts[starIndex - 1]++;
      }
    });

    this.ratings = this.ratings.map((item, index) => {
      const count = ratingCounts[4 - index];
      const percentage = Math.round((count / this.globalRatingsCount) * 100);
      return { ...item, percentage };
    });

    const totalStars = validRatings.reduce((sum, r) => sum + r.rating, 0);
    this.averageRating = parseFloat(
      (totalStars / this.globalRatingsCount).toFixed(1)
    );
  }

  // ✅ Views — show 0 on 400
  viewDetails() {
    this.ratingViewChartServ.getViewsDetailsList().subscribe({
      next: (data: any) => {
        this.viewCount = data?.data ?? 0; // ✅ fallback to 0
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error fetching views', err);
        this.viewCount = 0; // ✅ don't crash — show 0
        this.loading = false;
      }
    });
  }

  // ✅ Chart — show empty chart on 400
  changeTimePeriod(period: string) {
    this.isLoading = true;
    this.selectedPeriod = period;

    this.ratingViewChartServ.getViewsPeriodForChart(period).subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
          this.updateChartData(res);
        } else {
          this.resetChartData(); // ✅ empty chart
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.log(err);
        this.resetChartData(); // ✅ don't crash — show empty chart
        this.isLoading = false;
      }
    });
  }

  // ✅ Reset chart to empty state
  resetChartData() {
    this.chartData = {
      labels: [] as never,
      datasets: [{
        ...this.chartData.datasets[0],
        data: [] as never
      }]
    };
  }

  private updateChartData(apiData: any[]) {
    const labels = apiData.map(item => {
      if (this.selectedPeriod === 'daily') {
        return new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (this.selectedPeriod === 'weekly') {
        return `Week ${item._id.split('-')[1]}`;
      } else if (this.selectedPeriod === 'monthly') {
        return new Date(item._id).toLocaleDateString('en-US', { month: 'long' });
      } else {
        return item._id;
      }
    });

    const data = apiData.map(item => item.count);
    this.chartData = {
      labels: labels as never,
      datasets: [{
        ...this.chartData.datasets[0],
        data: data as never
      }]
    };
  }

  doughnutData = {
    labels: ['Veg', 'Non-Veg'],
    datasets: [{
      data: [40, 60],
      backgroundColor: ['#94d396', '#f49690'],
      hoverBackgroundColor: ['#66BB6A', '#EF5350'],
    }],
  };

  doughnutOptions = {
    cutout: '70%',
    plugins: { legend: { display: false } },
  };

  chartData = {
    labels: [],
    datasets: [{
      label: 'Customer Visits',
      data: [],
      backgroundColor: '#42A5F5',
      borderColor: '#1E88E5',
      borderWidth: 1
    }]
  };

  chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, callback: (value: any) => value },
        grid: { drawTicks: false }
      },
      x: { grid: { display: false } }
    },
    plugins: { legend: { display: false } }
  };

  getStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return (
      '<i class="pi pi-star-fill"></i>'.repeat(fullStars) +
      (halfStar ? '<i class="pi pi-star-half"></i>' : '') +
      '<i class="pi pi-star"></i>'.repeat(emptyStars)
    );
  }

  onLogoutButton() {
    localStorage.removeItem('token');  // ✅ clear token on logout
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    this.router.navigate(['login']);
  }
}