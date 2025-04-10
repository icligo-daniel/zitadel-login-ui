import { DynamicTheme } from "@/components/dynamic-theme";
import { SignInWithIdp } from "@/components/sign-in-with-idp";
import { UsernameForm } from "@/components/username-form";
import { getServiceUrlFromHeaders } from "@/lib/service";
import {
  getActiveIdentityProviders,
  getBrandingSettings,
  getDefaultOrg,
  getLoginSettings,
  getOrgsByDomain,
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

  // Get the domain from the host header
  const host = _headers.get("host") || "";
  const domain = host.split(":")[0]; // Remove port if present

  // Try to find organization by domain
  let domainOrganization;
  if (domain && domain !== "localhost") {
    const orgs = await getOrgsByDomain({
      serviceUrl,
      domain,
    });
    if (orgs && orgs.result && orgs.result.length > 0) {
      domainOrganization = orgs.result[0].id;
    }
  }

  let defaultOrganization;
  if (!organization && !domainOrganization) {
    const org: Organization | null = await getDefaultOrg({
      serviceUrl,
    });
    if (org) {
      defaultOrganization = org.id;
    }
  }

  // Use domain organization if available, otherwise fall back to search params or default
  const effectiveOrganization =
    domainOrganization ?? organization ?? defaultOrganization;

  const loginSettings = await getLoginSettings({
    serviceUrl,
    organization: effectiveOrganization,
  });

  const contextLoginSettings = await getLoginSettings({
    serviceUrl,
    organization: effectiveOrganization,
  });

  const identityProviders = await getActiveIdentityProviders({
    serviceUrl,
    orgId: effectiveOrganization,
  })
    .then((resp) => {
      return resp.identityProviders;
    })
    .catch((err) => {
      console.error("Error getting active identity providers", err);
      return [];
    });

  const branding = await getBrandingSettings({
    serviceUrl,
    organization: effectiveOrganization,
  });

  return (
    <DynamicTheme branding={branding}>
      <div className="flex flex-col items-center space-y-4">
        <h1>{t("title")}</h1>
        <p className="ztdl-p">{t("description")}</p>

        <UsernameForm
          loginName={loginName}
          requestId={requestId}
          organization={effectiveOrganization}
          loginSettings={contextLoginSettings}
          suffix={suffix}
          submit={submit}
          allowRegister={!!loginSettings?.allowRegister}
        >
          {identityProviders && (
            <SignInWithIdp
              identityProviders={identityProviders}
              requestId={requestId}
              organization={effectiveOrganization}
            ></SignInWithIdp>
          )}
        </UsernameForm>
      </div>
    </DynamicTheme>
  );
}
