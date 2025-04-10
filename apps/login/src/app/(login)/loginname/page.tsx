import { DynamicTheme } from "@/components/dynamic-theme";
import { SignInWithIdp } from "@/components/sign-in-with-idp";
import { UsernameForm } from "@/components/username-form";
import { getServiceUrlFromHeaders } from "@/lib/service";
import {
  getActiveIdentityProviders,
  getBrandingSettings,
  getDefaultOrg,
  getLoginSettings,
} from "@/lib/zitadel";
import { Organization } from "@zitadel/proto/zitadel/org/v2/org_pb";
import { getLocale, getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export default async function Page(props: {
  searchParams: Promise<Record<string | number | symbol, string | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const locale = getLocale();
  const t = await getTranslations({ locale, namespace: "loginname" });

  const loginName = searchParams?.loginName;
  const requestId = searchParams?.requestId;
  const organization = searchParams?.organization;
  const suffix = searchParams?.suffix;
  const submit: boolean = searchParams?.submit === "true";

  const _headers = await headers();
  const { serviceUrl } = getServiceUrlFromHeaders(_headers);

  let defaultOrganization;
  if (!organization) {
    const org: Organization | null = await getDefaultOrg({
      serviceUrl,
    });
    if (org) {
      defaultOrganization = org.id;
    }
  }

  // console.log("organization", organization);
  // console.log("defaultOrganization", defaultOrganization);

  const loginSettings = await getLoginSettings({
    serviceUrl,
    organization: organization ?? defaultOrganization,
  });

  const contextLoginSettings = await getLoginSettings({
    serviceUrl,
    organization,
  });

  const identityProviders = await getActiveIdentityProviders({
    serviceUrl,
    orgId: organization ?? defaultOrganization,
  })
    .then((resp) => {
      // console.log("resp", resp);
      return resp.identityProviders;
    })
    .catch((err) => {
      console.error("Error getting active identity providers", err);
      return [];
    });

  const branding = await getBrandingSettings({
    serviceUrl,
    organization: organization ?? defaultOrganization,
  });

  // console.log("branding", branding);

  return (
    <DynamicTheme branding={branding}>
      <div className="flex flex-col items-center space-y-4">
        <h1>{t("title")}</h1>
        <p className="ztdl-p">{t("description")}</p>

        <UsernameForm
          loginName={loginName}
          requestId={requestId}
          organization={organization} // stick to "organization" as we still want to do user discovery based on the searchParams not the default organization, later the organization is determined by the found user
          loginSettings={contextLoginSettings}
          suffix={suffix}
          submit={submit}
          allowRegister={!!loginSettings?.allowRegister}
        >
          {identityProviders && (
            <SignInWithIdp
              identityProviders={identityProviders}
              requestId={requestId}
              organization={organization}
            ></SignInWithIdp>
          )}
        </UsernameForm>
      </div>
    </DynamicTheme>
  );
}
