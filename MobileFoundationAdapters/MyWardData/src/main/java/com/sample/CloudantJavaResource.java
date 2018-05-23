/**
* Copyright 2017 IBM Corp.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
package com.sample;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.lightcouch.NoDocumentException;

import com.cloudant.client.api.Database;
import com.ibm.mfp.adapter.api.AdaptersAPI;
import com.ibm.mfp.adapter.api.ConfigurationAPI;
import com.ibm.mfp.adapter.api.OAuthSecurity;

@Path("/")
@OAuthSecurity(scope = "UserLogin")
public class CloudantJavaResource {
	/*
	 * For more info on JAX-RS see https://jax-rs-spec.java.net/nonav/2.0-rev-a/apidocs/index.html
	 */

	@Context
	AdaptersAPI adaptersAPI;
	static ConfigurationAPI configurationAPI;
	private Database getDB() throws Exception {
		CloudantJavaApplication app = adaptersAPI.getJaxRsApplication(CloudantJavaApplication.class);
		if (app.db != null) {
			return app.db;
		}
		throw new Exception("Unable to connect to Cloudant DB, check the configuration.");
	}

	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response addEntry(MyWardGrievance myWardGrievance) throws Exception {
		if (myWardGrievance != null && myWardGrievance.hasRequiredFields()) {
			getDB().save(myWardGrievance);
			//broadcast starts here;
			String authtokenbearer = null;
			authtokenbearer = gettoken();
			int  status = sendPush(authtokenbearer);
			System.out.println(authtokenbearer);
			System.out.println(status);
			//broadcast ends here
			return Response.ok().build();
		} else {
			return Response.status(400).build();
		}
	}
	private static int sendPush(String authtokenbearer) {
		System.out.println("Sending push notification");
		CloseableHttpClient httpClient = HttpClients.createDefault();
		HttpPost request = new HttpPost("https://mobilefoundation-9v9c-server.eu-gb.mybluemix.net/imfpush/v1/apps/org.mycity.myward/messages");
		StringEntity params;
		try {
			params = new StringEntity("{\"message\" : {    \"alert\" : \"Hey, new problem has been reported in your area!! \"  }}");
			request.addHeader("Content-Type", "application/json");
			request.addHeader("Authorization", authtokenbearer );
			request.setEntity(params);
			HttpResponse response = httpClient.execute(request);
			code = response.getStatusLine().getStatusCode();
			httpClient.close();
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		} catch (ClientProtocolException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return code;
		
	}

private static String gettoken() {
	// TODO Auto-generated method stub
	String authtoken ="Bearer";
	CloseableHttpClient httpClienttoken = HttpClients.createDefault();
	HttpPost requesttoken = new HttpPost("https://mobilefoundation-9v9c-server.eu-gb.mybluemix.net/mfp/api/az/v1/token");
	StringEntity paramstoken;
	try {
		 paramstoken = new StringEntity("grant_type=client_credentials&scope=push.application.org.mycity.myward%20messages.write");
		 requesttoken.addHeader("Content-Type", "application/x-www-form-urlencoded");
		 requesttoken.addHeader("Authorization", "Basic dGVzdDp0ZXN0");
		 requesttoken.setEntity(paramstoken);
		 HttpResponse responsetoken = httpClienttoken.execute(requesttoken);
		 String body = EntityUtils.toString(responsetoken.getEntity());
		 String[] str=body.split("\"");
		 String token = str[3];
		 authtoken = authtoken.concat(" ").concat(token);
		 System.out.println(authtoken);
		 httpClienttoken.close();
	} catch (UnsupportedEncodingException e) {
		e.printStackTrace();
	} catch (ClientProtocolException e) {
		e.printStackTrace();
	} catch (IOException e) {
		e.printStackTrace();
	}
	return authtoken;
	
}

	@DELETE
	@Path("/{id}")
	public Response deleteEntry(@PathParam("id") String id) throws Exception {
		try {
			MyWardGrievance myWardGrievance = getDB().find(MyWardGrievance.class, id);
			getDB().remove(myWardGrievance);
			return Response.ok().build();
		} catch (NoDocumentException e) {
			return Response.status(404).build();
		}
	}

	@GET
	@Produces("application/json")
	public Response getAllEntries() throws Exception {
		List<MyWardGrievance> entries = getDB().view("_all_docs").includeDocs(true).query(MyWardGrievance.class);
		return Response.ok(entries).build();
	}

	@GET
	@Path("/objectStorage")
	@Produces("application/json")
	public Response getObjectStorageAccess() throws Exception {
		CloudantJavaApplication app = adaptersAPI.getJaxRsApplication(CloudantJavaApplication.class);
		return Response.ok(app.getObjectStorageAccess()).build();
	}
}
