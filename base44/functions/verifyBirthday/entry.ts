import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) {
    return Response.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { month, day, year } = await req.json();

  if (!month || !day || !year) {
    return Response.json({ error: 'Complete birthday required' }, { status: 400 });
  }

  const monthNum = parseInt(month);
  const dayNum = parseInt(day);
  const yearNum = parseInt(year);

  if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31 || yearNum < 1900 || yearNum > new Date().getFullYear()) {
    return Response.json({ error: 'Invalid date' }, { status: 400 });
  }

  // Compute age server-side — the birthday itself is never stored.
  const birthDate = new Date(yearNum, monthNum - 1, dayNum);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const isOver13 = age >= 13;
  const ageCategory = age < 13 ? 'under_13' : (age < 18 ? 'teen' : 'adult');

  // Persist via service role so the client cannot forge these flags
  // through a direct updateMe call.
  await base44.asServiceRole.entities.User.update(user.id, {
    is_over_13: isOver13,
    birthday_verified: true,
    needs_birthday_check: false,
    age_category: ageCategory
  });

  return Response.json({ is_over_13: isOver13, age_category: ageCategory });
});