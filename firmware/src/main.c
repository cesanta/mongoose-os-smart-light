#include "mgos.h"
#include "mgos_shadow.h"

static void delta_cb(int ev, void *ev_data, void *userdata) {
  struct mg_str *delta = (struct mg_str *) ev_data;
  // json_scanf(args.p, args.len, "{state: %T}", &st);
  LOG(LL_INFO, ("GOT DELTA: [%.*s]", (int) delta->len, delta->p));

  // struct mgos_shadow_update_data *update_data = ev_data;
  // struct mgos_shadow_update_data *data = ev_data;
  // struct mbuf mb;
  // struct json_out out = JSON_OUT_MBUF(&mb);
  // mbuf_init(&mb, 100);
  // json_vprintf(&out, data->json_fmt, data->ap);
  // if (data->version == 0) {
  //   mgos_dash_callf_noreply("Dash.Shadow.Update", "{state: {reported:
  //   %.*s}}",
  //                           (int) mb.len, mb.buf);
  // } else {
  //   mgos_dash_callf_noreply("Dash.Shadow.Update",
  //                           "{version: %llu, state: {reported: %.*s}}",
  //                           data->version, (int) mb.len, mb.buf);
  // }
  // mbuf_free(&mb);
  (void) ev;
  (void) userdata;
}

enum mgos_app_init_result mgos_app_init(void) {
  mgos_event_add_handler(MGOS_SHADOW_UPDATE_DELTA, delta_cb, NULL);
  return MGOS_APP_INIT_SUCCESS;
}
