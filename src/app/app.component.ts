import { Component } from "@angular/core";

import { setTheme } from "ngx-bootstrap/utils";
import { BsDatepickerConfig } from "ngx-bootstrap/datepicker/public_api";
import { HttpClient } from "@angular/common/http";
import * as moment from "moment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  bsConfig: Partial<BsDatepickerConfig>;
  colorTheme = "theme-blue";

  constructor(private httpClient: HttpClient) {
    setTheme("bs4"); // or 'bs3'
    this.bsConfig = Object.assign({}, { containerClass: this.colorTheme });
    this.bsValue.setDate(this.bsValue.getDate() - 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
    this.trendsRegionShown = "Trends";
    this.trendsTimeRangeShown = "";
  }

  url = "/twitter_trend/_search";
  queryBody = {
    size: 0,
    query: {
      bool: {
        must: {
          match: {
            woeid: 2473224
          }
        },
        filter: {
          range: {
            time_stamp: {
              gt: 1538352000,
              lt: 1543629408
            }
          }
        }
      }
    },
    aggs: {
      most_popular_trend: {
        terms: {
          field: "trend",
          size: 100
        },
        aggs: {
          max_popular: {
            max: {
              field: "popularity"
            }
          },
          popular_trend_sort: {
            bucket_sort: {
              sort: [
                {
                  max_popular: { order: "desc" }
                }
              ],
              size: 20
            }
          }
        }
      }
    }
  };
  locations = [
    {
      id: 2473224,
      name: "Pittsburgh"
    },
    {
      id: 23424977,
      name: "United States"
    },
    {
      id: 23424775,
      name: "Canada"
    },
    {
      id: 23424848,
      name: "India"
    },
    {
      id: 23424856,
      name: "Japan"
    },
    {
      id: 23424975,
      name: "England"
    },
    {
      id: 23424829,
      name: "Germany"
    },
    {
      id: 23424748,
      name: "Australia"
    }
  ];
  form = {
    locationID: 0,
    timeRange: null
  };
  locationIdToName = {
    2473224: "Pittsburgh",
    23424977: "United States",
    23424775: "Canada",
    23424848: "India",
    23424856: "Japan",
    23424975: "England",
    23424829: "Germany",
    23424748: "Australia"
  };
  trendsRegionShown = "";
  trendsTimeRangeShown = "";
  search = "";
  tweets = [];

  async onSubmit() {
    this.form.timeRange = this.bsRangeValue;
    // id
    this.queryBody.query.bool.must.match.woeid = this.form.locationID;
    // time range
    this.queryBody.query.bool.filter.range.time_stamp.gt = this.transformDateToUnix(
      this.form.timeRange[0]
    );
    this.queryBody.query.bool.filter.range.time_stamp.lt = this.transformDateToUnix(
      this.form.timeRange[1]
    );
    // change trends title
    if (this.form.locationID !== 0) {
      this.trendsRegionShown = this.locationIdToName[this.form.locationID] + " trends";
    }
    this.trendsTimeRangeShown = "(" + this.transformDateToString(this.form.timeRange[0]) + "-" + this.transformDateToString(this.form.timeRange[1]) + ") ";

    console.log(this.queryBody);
    await this.sendPostRequest(this.queryBody).subscribe(
      data => {
        console.log(data);
        // this.tweets = data;
      },
      error => {
        console.error(error);
      }
    );
  }

  async onSearch() {
    console.log(this.search);
    console.log(moment().unix());
    // id
    this.queryBody.query.bool.must.match.woeid = this.form.locationID;
    // time range
    this.queryBody.query.bool.filter.range.time_stamp.gt =
      this.form.timeRange != null
        ? this.transformDateToUnix(this.form.timeRange[0])
        : 0;
    this.queryBody.query.bool.filter.range.time_stamp.lt =
      this.form.timeRange != null
        ? this.transformDateToUnix(this.form.timeRange[1])
        : moment().unix();

    console.log(this.queryBody);
    await this.sendPostRequest(this.queryBody).subscribe(
      data => {
        console.log(data);
      },
      error => {
        console.error(error);
      }
    );
  }

  sendPostRequest(body) {
    return this.httpClient.post(this.url, body, { observe: "response" });
  }

  transformDateToUnix(date: Date): number {
    return moment(date, "X").unix();
  }
  transformDateToString(date: Date): string {
    return moment(date).format("MM/DD/YYYY");
  }
}
