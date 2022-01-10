import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import{MatBadgeModule} from '@angular/material/badge';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import {MatSelectModule} from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import { MatInputModule } from '@angular/material/input'
import {MatSortModule} from '@angular/material/sort';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule} from '@angular/material/core';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard/dashboard.component';
import {MatTabsModule} from '@angular/material/tabs';
import { CreateNewBidComponent } from './create-new-bid/create-new-bid.component';
import { YourBidsComponent } from './your-bids/your-bids.component';
import { BidFeedsComponent } from './bid-feeds/bid-feeds.component';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { LoginComponent } from './login/login.component';
import { FeedComponent } from './feed/feed.component';
import {CdkAccordionModule} from '@angular/cdk/accordion';
import { NestedAccordionComponent } from './nested-accordion/nested-accordion.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { MessagingComponent } from './messaging/messaging.component';
import { MessagePreviewComponent } from './messaging/message-preview/message-preview.component';
import { NewMessageComponent } from './messaging/new-message/new-message.component';
import { ChatViewComponent } from './messaging/chat-view/chat-view.component';
import { AvailableMessageUsersComponent } from './available-message-users/available-message-users.component';
import { DocManagementModalComponent } from './doc-management-modal/doc-management-modal.component';
import { ToastrModule } from 'ngx-toastr';
import { BidConfirmationDialogComponent } from './bid-confirmation-dialog/bid-confirmation-dialog.component';
import { EarningsLossesComponent } from './earnings-losses/earnings-losses.component';
import { GraphicalChartComponent } from './earnings-losses/graphical-chart/graphical-chart.component';
import { AdminChooseWinnerComponent } from './admin-choose-winner/admin-choose-winner.component';
import { HotTableModule } from '@handsontable/angular';
import { registerAllModules } from 'handsontable/registry';
import Handsontable from 'handsontable/base';
import { NumericCellType, registerCellType } from 'handsontable/cellTypes';
import { registerPlugin, UndoRedo } from 'handsontable/plugins';

registerAllModules();

// register the `NumericCellType` module
registerCellType(NumericCellType);

// register the `UndoRedo` module
registerPlugin(UndoRedo);

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    CreateNewBidComponent,
    YourBidsComponent,
    BidFeedsComponent,
    LoginComponent,
    FeedComponent,
    NestedAccordionComponent,
    ToolbarComponent,
    MessagingComponent,
    MessagePreviewComponent,
    NewMessageComponent,
    ChatViewComponent,
    AvailableMessageUsersComponent,
    DocManagementModalComponent,
    BidConfirmationDialogComponent,
    EarningsLossesComponent,
    GraphicalChartComponent,
    AdminChooseWinnerComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    BrowserModule,
    MatFormFieldModule,
    AppRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatBadgeModule,
    HttpClientModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    BrowserModule,
    HotTableModule,
    MatTooltipModule,
    MatSortModule,
    CdkAccordionModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, // for firestore
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-left',
      preventDuplicates: true,
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
