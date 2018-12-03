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
    this.trends = [
      {
        key: "House",
        doc_count: 45,
        max_popular: { value: 1869508.0 }
      },
      {
        key: "Happy Halloween",
        doc_count: 19,
        max_popular: { value: 1663766.0 }
      },
      {
        key: "Congress",
        doc_count: 17,
        max_popular: { value: 1074425.0 }
      },
      {
        key: "Democrats",
        doc_count: 12,
        max_popular: { value: 1040744.0 }
      },
      {
        key: "#ENDviolence",
        doc_count: 11,
        max_popular: { value: 518689.0 }
      },
      {
        key: "Thousand Oaks",
        doc_count: 11,
        max_popular: { value: 401818.0 }
      },
      {
        key: "#ElectionDay",
        doc_count: 45,
        max_popular: { value: 374736.0 }
      },
      {
        key: "#Riverdale",
        doc_count: 10,
        max_popular: { value: 280121.0 }
      },
      {
        key: "#ElectionNight",
        doc_count: 14,
        max_popular: { value: 269070.0 }
      },
      {
        key: "#ARSLIV",
        doc_count: 12,
        max_popular: { value: 264875.0 }
      },
      {
        key: "Alec Baldwin",
        doc_count: 14,
        max_popular: { value: 229860.0 }
      },
      {
        key: "Dez Bryant",
        doc_count: 9,
        max_popular: { value: 213625.0 }
      },
      {
        key: "Infowars",
        doc_count: 9,
        max_popular: { value: 193010.0 }
      },
      {
        key: "#StrangerThingsDay",
        doc_count: 19,
        max_popular: { value: 180703.0 }
      },
      {
        key: "#Midterms2018",
        doc_count: 18,
        max_popular: { value: 158062.0 }
      },
      {
        key: "#ThankUNext",
        doc_count: 9,
        max_popular: { value: 136601.0 }
      },
      {
        key: "Steelers",
        doc_count: 11,
        max_popular: { value: 134427.0 }
      },
      {
        key: "Lucy McBath",
        doc_count: 12,
        max_popular: { value: 133263.0 }
      },
      {
        key: "Michael Thomas",
        doc_count: 13,
        max_popular: { value: 120772.0 }
      },
      {
        key: "Penguins",
        doc_count: 41,
        max_popular: { value: 118557.0 }
      }
    ];
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
    this.trendsRegionShown =
      this.locationIdToName[this.form.locationID] + " trends";
    this.trendsTimeRangeShown =
      "(" +
      this.transformDateToString(this.form.timeRange[0]) +
      "-" +
      this.transformDateToString(this.form.timeRange[1]) +
      ") ";

    console.log(this.queryBody);
    await this.sendPostRequest(this.queryBody).subscribe(
      (data: any) => {
        console.log(data);
        this.tweets = data.aggregations.most_popular_trend.buckets;
      },
      error => {
        console.error(error);
      }
    );
  }

  async onSearch() {
    if (this.search.trim() === "") return;
    console.log(this.search);
    // change alert content
    this.selectOrSearch(this.search);
    // id
    this.queryBody.query.bool.must.match.woeid = this.form.locationID;
    // time range
    this.queryBody.query.bool.filter.range.time_stamp.gt = this.transformDateToUnix(
      this.form.timeRange[0]
    );
    this.queryBody.query.bool.filter.range.time_stamp.lt = this.transformDateToUnix(
      this.form.timeRange[1]
    );

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

  selectOrSearch(key: string) {
    let tweetsContent = document.getElementById("tweetsContent");
    tweetsContent.scrollIntoView();
    this.contentOfAlert = key;
    this.selectedOrSearched = true;
    console.log(key);
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
