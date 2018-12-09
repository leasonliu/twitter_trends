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
    this.onSubmit();
  }

  url_trend = "/twitter_trend/_search";
  url_tweet = "/twitter_tweet/_search";
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
  searchBody = {
    query: {
      bool: {
        must: [
          {
            match_phrase: {
              text: ""
            }
          }
        ]
      }
    },
    size: 20,
    sort: [
      {
        popularity: {
          order: "desc"
        }
      }
    ]
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
    locationID: 2473224,
    timeRange: this.bsRangeValue
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
  trends = []; // trends shown
  tweets = []; // tweets shown
  selectedOrSearched = false; // show after selected or search
  contentOfAlert = "";

  async onSubmit() {
    this.form.timeRange = this.bsRangeValue;
    // clear alert
    this.selectedOrSearched = false;
    // id
    this.queryBody.query.bool.must.match.woeid = this.form.locationID;
    // time range
    this.queryBody.query.bool.filter.range.time_stamp.gt = this.transformDateToUnix(
      this.form.timeRange[0]
    );
    this.queryBody.query.bool.filter.range.time_stamp.lt = this.transformDatePlusOneToUnix(
      this.form.timeRange[1]
    );
    // change trends title
    this.trendsRegionShown =
      this.locationIdToName[this.form.locationID] + " trends";
    this.trendsTimeRangeShown =
      "(" +
      this.transformDateToString(this.form.timeRange[0]) +
      "-" +
      this.transformDateToString(this.form.timeRange[1]) +
      ") ";

    console.log("QueryBody: ", this.queryBody);
    await this.sendPostRequest(this.url_trend, this.queryBody).subscribe(
      (data: any) => {
        console.log("Trends: ", data);
        this.trends = data.aggregations.most_popular_trend.buckets;
      },
      error => {
        console.error(error);
      }
    );
  }

  async onSearch(key: string) {
    if (key) this.search = key;
    if (this.search.trim() === "") return;
    // change alert content
    this.selectOrSearch(this.search);
    // key
    this.searchBody.query.bool.must[0].match_phrase.text = this.search.trim();
    
    console.log("SearchBody: ", this.searchBody);
    await this.sendPostRequest(this.url_tweet, this.searchBody).subscribe(
      (data: any) => {
        console.log("Tweets: ", data);
        this.tweets = data.hits.hits;
      },
      error => {
        console.error(error);
      }
    );
  }

  selectOrSearch(key: string) {
    let tweetsContent = document.getElementById("tweetsContent");
    tweetsContent.scrollIntoView();
    this.contentOfAlert = 'Top 20 tweets for "' + key + '"';
    this.selectedOrSearched = true;
  }

  sendPostRequest(url, body) {
    return this.httpClient.post(url, body);
  }

  transformDateToUnix(date: Date): number {
    return moment(date, "X").unix();
  }
  transformDatePlusOneToUnix(date: Date): number {
    return moment(date, "X")
      .add(1, "day")
      .unix();
  }
  transformDateToString(date: Date): string {
    return moment(date).format("MM/DD/YYYY");
  }
}
